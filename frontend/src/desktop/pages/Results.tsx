import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BgResults from "../../assets/results/BgResults.svg?url";
import Rayo from "../../assets/welcome/Rayo.svg";
import Corona from "../../assets/welcome/Corona.svg";

import type { PartyResultsNavState } from "../../lib/api";
import { getRoomState, resetRoomState } from "../../lib/roomStore";
import { supabase } from "../../lib/supabaseClient";
import { profilePicturePublicUrl } from "../../lib/api";

import MochiIcon from "../../assets/profile-pic/Mochi-Icon.svg";
import MisuIcon from "../../assets/profile-pic/Misu-Icon.svg";
import YukiIcon from "../../assets/profile-pic/Yuki-Icon.svg";

function isValidPartyNavState(s: unknown): s is PartyResultsNavState {
    if (!s || typeof s !== "object") return false;
    const o = s as Record<string, unknown>;
    if (o.winnerPlayer !== 1 && o.winnerPlayer !== 2) return false;
    if (typeof o.winnerName !== "string") return false;
    if (typeof o.player1Name !== "string") return false;
    if (typeof o.player2Name !== "string") return false;
    return true;
}

export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleExit = () => {
        const { socket } = getRoomState();
        if (socket) {
            socket.emit("room__close", { roomId: roomCode });
            // Add a brief timeout to ensure the emit is sent over WebSocket before connection closes
            setTimeout(() => {
                socket.disconnect();
            }, 100);
        }
        resetRoomState();
    };
    const navState = location.state as unknown;
    const [scale, setScale] = useState(1);
    const [party] = useState<PartyResultsNavState | null>(() =>
        isValidPartyNavState(navState) ? navState : null,
    );

    const [p1Avatar, setP1Avatar] = useState<string>("");
    const [p2Avatar, setP2Avatar] = useState<string>("");

    const roomCode = party?.roomCode ?? "----";
    const winnerPlayer = party?.winnerPlayer ?? 1;
    const winnerName = party?.winnerName ?? "Player 1";
    const player1Name = party?.player1Name ?? "Player 1";
    const player2Name = party?.player2Name ?? "Player 2";
    const p1Score = party?.player1Score ?? 0;
    const p2Score = party?.player2Score ?? 0;
    const rewardName = party?.rewardName;

    const p1 = getRoomState().players.find(p => p.role === "P1") ?? null;
    const p2 = getRoomState().players.find(p => p.role === "P2") ?? null;

    const p1UserId = party?.player1UserId || p1?.userId;
    const p1CharacterId = party?.player1CharacterId || p1?.characterId;
    const p2UserId = party?.player2UserId || p2?.userId;
    const p2CharacterId = party?.player2CharacterId || p2?.characterId;

    const getPlayerAvatar = async (userId: string, characterId: string | null | undefined): Promise<string> => {
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
        if (p1UserId) {
            void getPlayerAvatar(p1UserId, p1CharacterId).then((url) => setP1Avatar(url));
        } else {
            setP1Avatar("");
        }
    }, [p1UserId, p1CharacterId]);

    useEffect(() => {
        if (p2UserId) {
            void getPlayerAvatar(p2UserId, p2CharacterId).then((url) => setP2Avatar(url));
        } else {
            setP2Avatar("");
        }
    }, [p2UserId, p2CharacterId]);

    const avatarFor = (characterId: string | null | undefined, defaultRole: "P1" | "P2"): string => {
        const key = (characterId ?? "").toLowerCase();
        if (key.includes("misu")) return MisuIcon;
        if (key.includes("yuki")) return YukiIcon;
        if (key.includes("mochi")) return MochiIcon;
        return defaultRole === "P1" ? MochiIcon : MisuIcon;
    };

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

    return (
        <div
            className="flex w-screen items-center justify-center overflow-hidden bg-[#ED1C24]"
            style={{
                height: "100svh",
                backgroundImage: `url("${BgResults}")`,
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
                            Party Room - {roomCode}
                        </div>

                        <img
                            src={Rayo}
                            alt=""
                            aria-hidden
                            className="absolute"
                            style={{
                                top: "150px",
                                left: "1200px",
                                width: "80px",
                                height: "auto",
                                transform: "rotate(80deg)",
                            }}
                        />

                        <h1
                            className="absolute m-0 text-center text-[#FAFAFA]"
                            style={{
                                top: "118px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "611px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 800,
                                fontSize: "90px",
                                letterSpacing: "-1px",
                                lineHeight: "72px",
                            }}
                        >
                            The winner is...
                        </h1>

                        <p
                            className="absolute m-0 text-center text-[#FFFDF6]"
                            style={{
                                top: "190px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "500px",
                                fontFamily: "'Baloo 2', system-ui, sans-serif",
                                fontWeight: 700,
                                fontSize: "55px",
                                letterSpacing: "-1.04px",
                                lineHeight: "83px",
                            }}
                        >
                            {winnerName}
                        </p>

                        {rewardName ? (
                            <p
                                className="absolute m-0 text-center text-[#FFD700]"
                                style={{
                                    top: "265px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    fontFamily: "'Nunito', system-ui, sans-serif",
                                    fontWeight: 700,
                                    fontSize: "28px",
                                }}
                            >
                                Reward: {rewardName}
                            </p>
                        ) : null}

                        <div
                            className="absolute left-1/2 flex -translate-x-1/2 items-start justify-between"
                            style={{ top: "280px", width: "min(1050px, 80vw)" }}
                        >
                            <div className="relative flex flex-col items-center">
                                {winnerPlayer === 1 && (
                                    <img
                                        src={Corona}
                                        alt=""
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            top: "-18px",
                                            left: "-12px",
                                            width: "62px",
                                            height: "auto",
                                            transform: "rotate(-18deg)",
                                            zIndex: 10,
                                        }}
                                    />
                                )}

                                <div
                                    className="relative overflow-hidden rounded-full bg-white flex items-center justify-center"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        border: "12px solid #FAFAFA",
                                    }}
                                >
                                    <img
                                        src={p1Avatar || avatarFor(p1CharacterId, "P1")}
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
                                        fontSize: "41px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 1
                                </p>
                                <p
                                    className="m-0 mt-1.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "35px",
                                        letterSpacing: "-0.43px",
                                        lineHeight: "34px",
                                    }}
                                >
                                    {player1Name}
                                </p>
                                <p
                                    className="m-0 mt-1 text-center text-[#FFD700]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "20px",
                                    }}
                                >
                                    {p1Score} pts
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
                                {winnerPlayer === 2 && (
                                    <img
                                        src={Corona}
                                        alt=""
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            top: "-18px",
                                            left: "-12px",
                                            width: "80px",
                                            height: "auto",
                                            transform: "rotate(-18deg)",
                                            zIndex: 10,
                                        }}
                                    />
                                )}

                                <div
                                    className="relative overflow-hidden rounded-full bg-white flex items-center justify-center"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        border: "12px solid #FAFAFA",
                                    }}
                                >
                                    <img
                                        src={p2Avatar || avatarFor(p2CharacterId, "P2")}
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
                                        fontSize: "41px",
                                        letterSpacing: "-0.77px",
                                        lineHeight: "61px",
                                    }}
                                >
                                    Player 2
                                </p>
                                <p
                                    className="m-0 mt-1.5 text-center text-[#FFFDF6]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 600,
                                        fontSize: "35px",
                                        letterSpacing: "-0.43px",
                                        lineHeight: "34px",
                                    }}
                                >
                                    {player2Name}
                                </p>
                                <p
                                    className="m-0 mt-1 text-center text-[#FFD700]"
                                    style={{
                                        fontFamily: "'Nunito', system-ui, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "20px",
                                    }}
                                >
                                    {p2Score} pts
                                </p>
                            </div>
                        </div>

                        <p
                            className="absolute m-0 text-center text-[#FFFDF6]"
                            style={{
                                top: "800px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "517px",
                                fontFamily: "'Nunito', system-ui, sans-serif",
                                fontWeight: 600,
                                fontSize: "40px",
                                letterSpacing: "-0.76px",
                                lineHeight: "60px",
                            }}
                        >
                            Want to try another game?
                        </p>

                        <div
                            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-6"
                            style={{ top: "870px" }}
                        >
                            <div style={{ transform: "scale(0.88)", transformOrigin: "center" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleExit();
                                        navigate("/home");
                                    }}
                                    className="flex items-center justify-center gap-1 px-13 py-5 cursor-pointer rounded-full text-[#FAFAFA] text-2xl md:text-[20px] font-bold bg-[#FF7BE2] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                                >
                                    Go for It
                                </button>
                            </div>

                            <div style={{ transform: "scale(0.88)", transformOrigin: "center" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleExit();
                                        navigate("/welcome");
                                    }}
                                    className="flex items-center justify-center gap-1 px-13 py-5 cursor-pointer rounded-full text-[#FAFAFA] text-2xl md:text-[20px] font-bold bg-[#979797] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
                                >
                                    Not Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
