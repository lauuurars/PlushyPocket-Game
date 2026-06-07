import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WaitingBg from "../../assets/join/WaitingBg.svg?url";
import StarRoom from "../../assets/join/StarRoom.svg";
import FlorAzul from "../../assets/join/FlorAzul.svg";
import Estrella4 from "../../assets/join/Estrella4.svg";
import RayoRosa from "../../assets/join/RayoRosa.svg";
import AngryMisu from "../../assets/join/AngryMisu.svg";
import Corazon from "../../assets/welcome/Corazon.svg"
import { PinkButton } from "../../components/PinkButton";
import { createRealtimeSocket, fetchPartyRoomUserProfile } from "../../lib/api";
import type { GameStartPayload } from "../../lib/api";
import type { Socket } from "socket.io-client";
import { getRoomState, attachRoomListeners, updateRoomState } from "../../lib/roomStore";

const GAME_ROUTES: Record<string, string> = {
    "cake": "/shout-cake",
    "hammer-mole": "/hammer",
    "flappy-boat": "/flappy-boat-mobile",
};

export default function WaitingRoom() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = (searchParams.get("roomId") ?? searchParams.get("roomCode") ?? "5173").trim();
    const minigameId = (searchParams.get("minigameId") ?? "").trim();

    useEffect(() => {
        if (!roomId) return;

        let cancelled = false;
        const existing = getRoomState();
        const existingSocket = existing.socket?.connected ? existing.socket : null;

        let socket: Socket;
        let isNewSocket = false;

        if (existingSocket) {
            socket = existingSocket as unknown as Socket;
        } else {
            socket = createRealtimeSocket() as unknown as Socket;
            isNewSocket = true;
            updateRoomState({ socket, roomId, minigameId });
            attachRoomListeners(socket);
        }

        if (isNewSocket) {
            void (async () => {
                const profile = await fetchPartyRoomUserProfile();
                if (cancelled) return;

                const userId = profile?.id ?? localStorage.getItem("plushyPocket_dbUserId") ?? "";
                const username = profile?.displayName ?? "Player";
                const characterId = profile?.character_selected ?? localStorage.getItem("character") ?? "mochi";

                socket.emit("player__join", { userId, username, roomId, characterId });
            })();
        }

        socket.on("game_start", (payload: GameStartPayload) => {
            if (cancelled) return;
            updateRoomState({ players: payload.players, minigameId: payload.minigameId });
            const route = GAME_ROUTES[payload.minigameId] ?? `/${payload.minigameId}`;
            navigate(`${route}?roomId=${encodeURIComponent(payload.roomId)}`, { replace: true });
        });

        socket.on("room_not_found", () => {
            if (!cancelled) navigate("/qr-game", { replace: true });
        });

        return () => {
            cancelled = true;
            socket.off("game_start");
            socket.off("room_not_found");
        };
    }, [navigate, roomId, minigameId]);

    return (
        <div
            className="relative w-full overflow-hidden flex flex-col md:hidden"
            style={{ minHeight: "100svh", maxWidth: "430px", margin: "0 auto" }}
        >
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("${WaitingBg}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
                }}
            />

            <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                <img
                    src={FlorAzul}
                    alt=""
                    width={41}
                    height={41}
                    style={{
                        position: "absolute",
                        top: "31%",
                        left: "14%",
                    }}
                />

                <img
                    src={RayoRosa}
                    alt=""
                    width={37}
                    height={37}
                    style={{
                        position: "absolute",
                        top: "30%",
                        right: "14%",
                        transform: "rotate(-20deg)",
                    }}
                />

                <img
                    src={Estrella4}
                    alt=""
                    width={34}
                    height={48}
                    style={{
                        position: "absolute",
                        top: "55%",
                        right: "16%",
                        transform: "rotate(-3deg)",
                    }}
                />

                <img
                    src={Corazon}
                    alt=""
                    width={43}
                    height={43}
                    style={{
                        position: "absolute",
                        top: "57%",
                        left: "9%",
                        transform: "rotate(10deg)",
                    }}
                />
            </div>

            <div className="relative flex flex-col w-full" style={{ zIndex: 3, flex: 1 }}>
                <h1
                    className="m-0 text-center"
                    style={{
                        position: "absolute",
                        top: "15%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "min(295px, 84vw)",
                        fontFamily: "'Baloo 2', cursive",
                        fontWeight: 800,
                        fontSize: "40px",
                        lineHeight: "37px",
                        letterSpacing: "-1px",
                        color: "#FAFAFA",
                        textShadow: "0 3px 16px rgba(0,0,0,0.12)",
                    }}
                >
                    Waiting for
                    <br />
                    another player...
                </h1>

                <div
                    className="absolute left-1/2"
                    style={{
                        top: "32%",
                        transform: "translateX(-50%)",
                        width: "min(190px, 52vw)",
                    }}
                >
                    <div className="relative w-full">
                        <img src={StarRoom} alt={`Sala ${roomId}`} className="block w-full" draggable={false} />
                        <span
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingTop: "20px",
                                fontFamily: "'Baloo 2', cursive",
                                fontWeight: 800,
                                fontSize: "47px",
                                lineHeight: "96px",
                                letterSpacing: "-1.34px",
                                color: "#583921",
                            }}
                        >
                            {roomId}
                        </span>
                    </div>
                </div>

                <div
                    className="absolute left-1/2 flex justify-center"
                    style={{
                        top: "63%",
                        transform: "translateX(-50%)",
                    }}
                >
                    <div style={{ transform: "scale(0.9)", transformOrigin: "center" }}>
                        <PinkButton
                            text="Exit P|arty"
                            onClick={() => {
                                window.history.pushState(null, "", "/home-phone");
                            }}
                        />
                    </div>
                </div>
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 bottom-1 z-20 flex justify-center"
                aria-hidden
            >
                <img
                    src={AngryMisu}
                    alt=""
                    className="w-[min(300px,86vw)] translate-y-1.5 object-contain object-bottom"
                    draggable={false}
                />
            </div>
        </div>
    );
}
