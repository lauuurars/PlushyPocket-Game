import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import BgParty from "../../assets/startGame/Bg Party.svg?url";
import Rayo from "../../assets/welcome/Rayo.svg";
import MochiIcon from "../../assets/profile-pic/Mochi-Icon.svg";
import MisuIcon from "../../assets/profile-pic/Misu-Icon.svg";
import YukiIcon from "../../assets/profile-pic/Yuki-Icon.svg";
import { createRealtimeSocket, profilePicturePublicUrl, type GameStartPayload, type RoomUpdatePayload } from "../../lib/api";
import { updateRoomState, attachRoomListeners, getRoomState } from "../../lib/roomStore";
import { supabase } from "../../lib/supabaseClient";

let globalSocket: ReturnType<typeof createRealtimeSocket> | null = null;

export default function PartyRoom() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [scale, setScale] = useState(1);
    const [room, setRoom] = useState<RoomUpdatePayload | null>(null);
    const [startPayload, setStartPayload] = useState<GameStartPayload | null>(null);

    const [p1Avatar, setP1Avatar] = useState<string>("");
    const [p2Avatar, setP2Avatar] = useState<string>("");

    const roomId = (searchParams.get("roomId") ?? "").trim();
    const islandName = (searchParams.get("islandName") ?? "Sanrio Island").trim();
    const minigameIdFromUrl = (searchParams.get("minigameId") ?? "").trim();

    const COUNTDOWN_SECONDS = 5;
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownRef = useRef<number>(COUNTDOWN_SECONDS);

    useEffect(() => {
        if (!startPayload) return;

        countdownRef.current = COUNTDOWN_SECONDS;
        setCountdown(COUNTDOWN_SECONDS);

        const interval = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);
            if (countdownRef.current <= 0) {
                clearInterval(interval);
                const destination = startPayload.minigameId || minigameIdFromUrl;
                navigate(`/${destination}`, { replace: true });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate, startPayload, minigameIdFromUrl]);

    useEffect(() => {
        if (!roomId) return;

        if (!globalSocket || !getRoomState().socket) {
            const socket = createRealtimeSocket();
            globalSocket = socket;
            updateRoomState({ socket, roomId, minigameId: null, playerRole: null, players: [], scores: {} });
            attachRoomListeners(socket);
        } else {
            /* Ensure roomStore is up to date even when reusing existing socket */
            const st = getRoomState();
            if (st.roomId !== roomId) {
                updateRoomState({ roomId, minigameId: null, players: [], scores: {} });
            }
        }

        const socket = globalSocket;

        const onRoomUpdate = (payload: RoomUpdatePayload) => {
            setRoom(payload);
            updateRoomState({ players: payload.players });
        };

        const onGameStart = (payload: GameStartPayload) => {
            updateRoomState({
                players: payload.players,
                minigameId: payload.minigameId,
                ...(payload.gameEndTime ? { gameEndTime: payload.gameEndTime } : {}),
            });
            setStartPayload(payload);
        };

        socket.on("room_update", onRoomUpdate);
        socket.on("game_start", onGameStart);
        socket.emit("screen__join_room", { roomId });

        return () => {
            socket.off("room_update", onRoomUpdate);
            socket.off("game_start", onGameStart);
        };
    }, [navigate, roomId]);

    useEffect(() => {
        const updateScale = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const next = Math.min(vw / 1512, vh / 982, 1);
            setScale(next);
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    const p1 = useMemo(() => room?.players.find((p) => p.role === "P1") ?? null, [room?.players]);
    const p2 = useMemo(() => room?.players.find((p) => p.role === "P2") ?? null, [room?.players]);

    const getPlayerAvatar = async (userId: string, characterId: string | null): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("character_selected, profile_picture_path")
                .eq("id", userId)
                .maybeSingle();

            if (!error && data?.profile_picture_path) {
                const pathLower = data.profile_picture_path.toLowerCase();
                const isDefaultChar = pathLower.includes("mochi.svg") || pathLower.includes("misu.svg") || pathLower.includes("yuki.svg") ||
                                      pathLower.includes("mochi.png") || pathLower.includes("misu.png") || pathLower.includes("yuki.png");
                if (!isDefaultChar) {
                    const url = profilePicturePublicUrl(data.profile_picture_path);
                    if (url) return url;
                }
            }

            const char = (data?.character_selected || characterId || "").toLowerCase();
            if (char.includes("misu")) return MisuIcon;
            if (char.includes("yuki")) return YukiIcon;
            return MochiIcon;
        } catch {
            const char = (characterId || "").toLowerCase();
            if (char.includes("misu")) return MisuIcon;
            if (char.includes("yuki")) return YukiIcon;
            return MochiIcon;
        }
    };

    useEffect(() => {
        if (p1?.userId) {
            void getPlayerAvatar(p1.userId, p1.characterId).then((url) => setP1Avatar(url));
        } else {
            setP1Avatar("");
        }
    }, [p1?.userId, p1?.characterId]);

    useEffect(() => {
        if (p2?.userId) {
            void getPlayerAvatar(p2.userId, p2.characterId).then((url) => setP2Avatar(url));
        } else {
            setP2Avatar("");
        }
    }, [p2?.userId, p2?.characterId]);

    const avatarFor = (characterId: string | null | undefined): string => {
        const key = (characterId ?? "").toLowerCase();
        if (key.includes("misu")) return MisuIcon;
        if (key.includes("yuki")) return YukiIcon;
        return MochiIcon;
    };

    return (
        <>
        <style>{`
            @keyframes countdown-pop {
                0%   { transform: scale(1.15); }
                40%  { transform: scale(1); }
                100% { transform: scale(1.15); }
            }
        `}</style>
        <div
            className="flex w-screen items-center justify-center overflow-hidden bg-[#ED1C24]"
            style={{
                height: "100svh",
                backgroundImage: `url("${BgParty}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="relative" style={{ width: 1512 * scale, height: 982 * scale }}>
                <div
                    className="absolute left-0 top-0"
                    style={{
                        width: 1512,
                        height: 982,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >

                    <div className="relative w-full" style={{ zIndex: 2, height: 982 }}>
                        <div
                            className="absolute text-[#FAFAFA]"
                            style={{
                                top: "62px",
                                left: "-230px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "45px",
                                letterSpacing: "-1px",
                                lineHeight: "72px",
                            }}
                        >
                            Party Room - {roomId || room?.roomId || "----"}
                        </div>

                        <img
                            src={Rayo}
                            alt=""
                            aria-hidden
                            className="absolute"
                            style={{
                                top: "200px",
                                left: "1200px",
                                width: "80px",
                                height: "auto",
                                transform: "rotate(80deg)",
                            }}
                        />

                        {/* Title: Welcome Players! */}
                        <h1
                            className="absolute m-0 text-center text-[#FAFAFA]"
                            style={{
                                top: "140px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "800px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 800,
                                fontSize: "85px",
                                letterSpacing: "-1px",
                                lineHeight: "1.1",
                            }}
                        >
                            Welcome Players!
                        </h1>

                        <p
                            className="absolute m-0 text-center text-[#FFFDF6]"
                            style={{
                                top: "255px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "600px",
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "30px",
                                letterSpacing: "-0.5px",
                                lineHeight: "1.2",
                            }}
                        >
                            Your next adventure together starts in{" "}
                            <strong className="font-extrabold">{islandName}</strong>
                        </p>

                        <div
                            className="absolute left-1/2 flex -translate-x-1/2 items-start justify-between"
                            style={{ top: "370px", width: "min(1050px, 80vw)" }}
                        >
                            <div className="relative flex flex-col items-center">
                                <div
                                    className="relative overflow-hidden rounded-full bg-white flex items-center justify-center"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        border: "12px solid #FAFAFA",
                                    }}
                                >
                                    <img
                                        src={p1Avatar || avatarFor(p1?.characterId)}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        draggable={false}
                                    />
                                </div>

                                <p
                                    className="m-0 mt-4.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "50px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 1
                                </p>
                                <p
                                    className="m-0 mt-2 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "23px",
                                        letterSpacing: "-0.43px",
                                        lineHeight: "34px",
                                    }}
                                >
                                    {p1?.username ?? "Waiting..."}
                                </p>
                            </div>

                            <p
                                className="m-0 text-center text-[#FFFDF6]"
                                style={{
                                    marginTop: "120px",
                                    fontFamily: "'Baloo 2', system-ui, sans-serif",
                                    fontWeight: 800,
                                    fontSize: "72px",
                                    letterSpacing: "-1.38px",
                                    lineHeight: "109px",
                                }}
                            >
                                VS
                            </p>

                            <div className="relative flex flex-col items-center">
                                <div
                                    className="relative overflow-hidden rounded-full bg-[#dedede] flex items-center justify-center"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        border: "12px solid #FAFAFA",
                                    }}
                                >
                                    {p2 ? (
                                        <img
                                            src={p2Avatar || avatarFor(p2.characterId)}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[rgba(250,250,250,0.08)] text-6xl font-bold text-[#583921]/40">
                                            P2
                                        </div>
                                    )}
                                </div>

                                <p
                                    className="m-0 mt-4.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "50px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 2
                                </p>
                                <p
                                    className="m-0 mt-2 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "23px",
                                        letterSpacing: "-0.43px",
                                        lineHeight: "34px",
                                    }}
                                >
                                    {p2?.username ?? "Waiting..."}
                                </p>
                            </div>
                        </div>
                        {/* Countdown — visible only after game_start fires */}
                        {countdown !== null && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "80px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "26px",
                                        color: "rgba(255,253,246,0.85)",
                                        letterSpacing: "-0.5px",
                                    }}
                                >
                                    Get ready! Starting in…
                                </p>
                                <div
                                    style={{
                                        width: "96px",
                                        height: "96px",
                                        borderRadius: "50%",
                                        background: "#FFD700",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                                        fontWeight: 900,
                                        fontSize: "52px",
                                        color: "#583921",
                                        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                                        border: "4px solid white",
                                        transition: "transform 0.15s",
                                        transform: "scale(1)",
                                        animation: "countdown-pop 1s ease-in-out infinite",
                                    }}
                                >
                                    {countdown}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
