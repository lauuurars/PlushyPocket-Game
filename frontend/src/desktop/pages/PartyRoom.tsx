import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import BgParty from "../../assets/startGame/Bg Party.svg?url";
import Rayo from "../../assets/welcome/Rayo.svg";
import MochiAvatarUrl from "../../assets/choose/Mochi.svg?url";
import MisuAvatarUrl from "../../assets/choose/Misu.svg?url";
import YukiAvatarUrl from "../../assets/choose/Yuki.svg?url";
import { createRealtimeSocket, type GameStartPayload, type RoomUpdatePayload } from "../../lib/api";
import { updateRoomState, attachRoomListeners, getRoomState } from "../../lib/roomStore";

let globalSocket: ReturnType<typeof createRealtimeSocket> | null = null;

export default function PartyRoom() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [scale, setScale] = useState(1);
    const [room, setRoom] = useState<RoomUpdatePayload | null>(null);
    const [startPayload, setStartPayload] = useState<GameStartPayload | null>(null);

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

    const avatarFor = (characterId: string | null | undefined): string => {
        const key = (characterId ?? "").toLowerCase();
        if (key.includes("misu")) return MisuAvatarUrl as string;
        if (key.includes("yuki")) return YukiAvatarUrl as string;
        return MochiAvatarUrl as string;
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
            style={{ height: "100svh" }}
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
                    <div
                        aria-hidden
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url("${BgParty}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            zIndex: 0,
                        }}
                    />

                    <div className="relative w-full" style={{ zIndex: 2, height: 982 }}>
                        <div
                            className="absolute text-[#FAFAFA]"
                            style={{
                                top: "62px",
                                left: "79px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "35px",
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
                                top: "97px",
                                left: "416px",
                                width: "31px",
                                height: "auto",
                                transform: "rotate(12deg)",
                            }}
                        />

                        <p
                            className="absolute m-0 text-center text-[#FFFDF6]"
                            style={{
                                top: "190px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "420px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "40px",
                                letterSpacing: "-1.04px",
                                lineHeight: "1.1",
                            }}
                        >
                            Your next adventure starts in{" "}
                            <strong className="font-extrabold">{islandName}</strong>
                        </p>

                        <div
                            className="absolute left-1/2 flex -translate-x-1/2 items-start justify-between"
                            style={{ top: "307px", width: "min(1050px, 80vw)" }}
                        >
                            <div className="relative flex flex-col items-center">
                                <div
                                    className="relative overflow-hidden rounded-full"
                                    style={{
                                        width: "296px",
                                        height: "296px",
                                        border: "12px solid #FAFAFA",
                                        backgroundColor: "rgba(250,250,250,0.12)",
                                    }}
                                >
                                    <img
                                        src={avatarFor(p1?.characterId)}
                                        alt=""
                                        className="h-full w-full object-contain object-center"
                                        draggable={false}
                                    />
                                </div>

                                <p
                                    className="m-0 mt-4.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "41px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 1
                                </p>
                                <p
                                    className="m-0 -mt-1.5 text-center text-[#FFFDF6]"
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
                                    className="relative overflow-hidden rounded-full"
                                    style={{
                                        width: "296px",
                                        height: "296px",
                                        border: "12px solid #FAFAFA",
                                        backgroundColor: "rgba(250,250,250,0.12)",
                                    }}
                                >
                                    {p2 ? (
                                        <img
                                            src={avatarFor(p2.characterId)}
                                            alt=""
                                            className="h-full w-full object-contain object-center"
                                            draggable={false}
                                        />
                                    ) : null}
                                </div>

                                <p
                                    className="m-0 mt-4.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Baloo 2', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "41px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 2
                                </p>
                                <p
                                    className="m-0 -mt-1.5 text-center text-[#FFFDF6]"
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
