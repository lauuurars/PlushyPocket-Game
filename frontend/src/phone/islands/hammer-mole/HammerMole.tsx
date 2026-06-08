import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Socket } from "socket.io-client";
import type { GameOverPayload } from "../../../lib/api";
import { createRealtimeSocket, fetchPartyRoomUserProfile } from "../../../lib/api";
import { getRoomState, updateRoomState } from "../../../lib/roomStore";
import Background from "../../../assets/moleAssets/HammerBg.jpg";
import Hammer from "../../../assets/moleAssets/Hammer.svg";

const SWING_THRESHOLD = 18;
const COOLDOWN_MS = 600;

interface DeviceMotionEventWithPermission extends EventTarget {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

function accelToDirection(ax: number, ay: number): string | null {
    const absX = Math.abs(ax);
    const absY = Math.abs(ay);
    const mag = Math.sqrt(ax * ax + ay * ay);
    if (mag < SWING_THRESHOLD) return null;

    const diagonal = absX > 6 && absY > 6;

    if (diagonal) {
        if (ax < 0 && ay > 0) return 'top-left';
        if (ax > 0 && ay > 0) return 'top-right';
        if (ax < 0 && ay < 0) return 'bottom-left';
        if (ax > 0 && ay < 0) return 'bottom-right';
    }

    if (absX > absY) return ax < 0 ? 'left' : 'right';
    return ay > 0 ? 'top' : 'bottom';
}

// Detectar iOS antes del componente para evitar setState en useEffect
const iosNeedsPermission =
    typeof (DeviceMotionEvent as unknown as DeviceMotionEventWithPermission).requestPermission === 'function';

export default function HammerMole() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");

    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [needsPermission, setNeedsPermission] = useState(iosNeedsPermission);
    const [userId, setUserId] = useState("");
    const [gameOverData, setGameOverData] = useState<{
        winnerId: string;
        myScore: number;
        opponentScore: number;
    } | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const userIdRef = useRef<string>("");
    const characterIdRef = useRef<string>("mochi");
    const lastSwingRef = useRef(0);
    const baselineRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!roomId) return;

        let cancelled = false;
        const existing = getRoomState();
        const socket = existing.socket?.connected
            ? (existing.socket as unknown as Socket)
            : (() => {
                const s = createRealtimeSocket() as unknown as Socket;
                updateRoomState({ socket: s, roomId });
                return s;
            })();

        socketRef.current = socket;

        void (async () => {
            const profile = await fetchPartyRoomUserProfile();
            if (cancelled) return;

            const id = profile?.id ?? localStorage.getItem("plushyPocket_dbUserId") ?? "";
            const username = profile?.displayName ?? "Player";
            const characterId = profile?.character_selected ?? localStorage.getItem("character") ?? "mochi";

            userIdRef.current = id;
            characterIdRef.current = characterId;
            setUserId(id); // también en estado para el render
            socket.emit("player__join", { userId: id, username, roomId, characterId });
        })();

        socket.on("game_timer_tick", (data: { remaining: number }) => {
            if (!cancelled) setTimeRemaining(data.remaining);
        });

        socket.on("game_over", (payload: GameOverPayload) => {
            if (cancelled) return;
            const myId = userIdRef.current;
            const myScore = payload.scores[myId] ?? 0;
            const opponentScore = Object.entries(payload.scores).find(
                ([id]) => id !== myId,
            )?.[1] ?? 0;
            setGameOverData({ winnerId: payload.winnerId, myScore, opponentScore });
        });

        socket.on("hit_confirmed", (data: { userId: string; points: number }) => {
            if (cancelled || data.userId !== userIdRef.current) return;
            setScore(prev => prev + data.points);
        });

        return () => {
            cancelled = true;
            socketRef.current = null;
        };
    }, [roomId]);

    const emitSwing = useCallback((direction: string) => {
        const socket = socketRef.current;
        if (!socket || !userIdRef.current || !roomId) return;

        socket.emit('player_action', {
            userId: userIdRef.current,
            characterId: characterIdRef.current,
            action: 'hammer_swing',
            timestamp: Date.now(),
            roomId,
            payload: { direction },
        });
    }, [roomId]);

    // Acelerómetro — Android y browsers sin restricción
    useEffect(() => {
        if (iosNeedsPermission) return; // iOS lo maneja requestMotionPermission()

        const handleMotion = (e: DeviceMotionEvent) => {
            const acc = e.acceleration;
            if (!acc || (acc.x === null && acc.y === null)) return;

            const ax = acc.x ?? 0;
            const ay = acc.y ?? 0;

            const now = Date.now();
            if (now - lastSwingRef.current < COOLDOWN_MS) return;

            const direction = accelToDirection(ax, ay);
            if (!direction) return;

            lastSwingRef.current = now;
            emitSwing(direction);
        };

        const calibrate = (e: DeviceMotionEvent) => {
            const acc = e.acceleration;
            if (!acc || (acc.x === null && acc.y === null)) return;
            window.removeEventListener('devicemotion', calibrate);
            window.addEventListener('devicemotion', handleMotion);
        };

        window.addEventListener('devicemotion', calibrate);
        return () => {
            window.removeEventListener('devicemotion', calibrate);
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [emitSwing]);

    const requestMotionPermission = async () => {
        const DeviceMotion = DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
        if (!DeviceMotion.requestPermission) return;

        try {
            const result = await DeviceMotion.requestPermission();
            if (result !== 'granted') return;

            setNeedsPermission(false);

            const handleMotion = (e: DeviceMotionEvent) => {
                const acc = e.accelerationIncludingGravity;
                if (!acc) return;

                const ax = (acc.x ?? 0) - baselineRef.current.x;
                const ay = (acc.y ?? 0) - baselineRef.current.y;

                const now = Date.now();
                if (now - lastSwingRef.current < COOLDOWN_MS) return;

                const direction = accelToDirection(ax, ay);
                if (!direction) return;

                lastSwingRef.current = now;
                emitSwing(direction);
            };

            const calibrate = (e: DeviceMotionEvent) => {
                const acc = e.accelerationIncludingGravity;
                if (!acc) return;
                baselineRef.current = { x: acc.x ?? 0, y: acc.y ?? 0 };
                window.removeEventListener('devicemotion', calibrate);
                window.addEventListener('devicemotion', handleMotion);
            };

            window.addEventListener('devicemotion', calibrate);
        } catch (err) {
            console.error('Permiso de movimiento denegado:', err);
        }
    };

    if (gameOverData) {
        // Usar userId del estado, NO del ref
        const isWinner = gameOverData.winnerId === userId;
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#ED1C24] p-8 text-center">
                <h1 className="text-5xl font-extrabold text-white" style={{ fontFamily: "'Baloo Da 2', system-ui, sans-serif" }}>
                    {isWinner ? "You Win!" : "You Lose"}
                </h1>
                <div className="rounded-2xl bg-white/20 p-6 text-white">
                    <p className="text-2xl font-bold">Your Score: {gameOverData.myScore}</p>
                    <p className="text-xl">Opponent: {gameOverData.opponentScore}</p>
                </div>
                <button
                    onClick={() => navigate("/home-phone")}
                    className="rounded-full bg-white px-8 py-3 text-lg font-bold text-[#ED1C24]"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-svh w-screen overflow-hidden bg-[#FAFAFA] md:hidden">
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage: `url("${Background}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div className="absolute left-1/2 -top-95 h-155 w-155 -translate-x-1/2 rounded-full bg-[#ED1C24]" />

            {timeRemaining !== null && (
                <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
                    <span className="rounded-full bg-white/90 px-4 py-1 text-lg font-bold text-[#ED1C24] shadow-md">
                        {timeRemaining}s
                    </span>
                </div>
            )}

            <div className="relative z-10 flex h-full w-full flex-col items-center px-8 pb-14 pt-18">
                <h1
                    className="text-center text-[44px] font-extrabold leading-10 tracking-[-1px] text-[#FAFAFA]"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    Move your phone
                    <br />
                    to hit moles!
                </h1>

                {needsPermission && (
                    <button
                        onClick={requestMotionPermission}
                        className="mt-6 rounded-full bg-white px-6 py-3 font-bold text-[#ED1C24] shadow-md"
                    >
                        Enable Motion Controls
                    </button>
                )}

                <div className="mt-14 flex w-full flex-1 items-center justify-center">
                    <img
                        src={Hammer}
                        alt="Hammer"
                        className="w-[320px] max-w-[88vw] select-none pointer-events-none"
                        draggable={false}
                    />
                </div>

                <div className="flex flex-col items-center">
                    <h2
                        className="text-center text-[54px] font-extrabold leading-12 tracking-[-1px] text-[#ED1C24]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        Game Points
                    </h2>
                    <p
                        className="mt-2 text-center text-[34px] font-extrabold leading-9 tracking-[-1px] text-[#583921]"
                        style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        {score} pts
                    </p>
                </div>
            </div>
        </div>
    );
}