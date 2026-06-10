import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import GamePoints from '../../../components/GamePoints';
import Timer from '../../../components/Timer';
import Catapulta from '../../../assets/cake/Catapulta.svg';
import CatapultaTwo from '../../../assets/cake/Catapulta2.svg';
import CatapultaThree from '../../../assets/cake/Catapulta3.svg';
import CatapultaFour from '../../../assets/cake/Catapulta4.svg';
import pastelazo from '../../../assets/cake/pastelazo.svg';
import Point1 from '../../../assets/cake/Point1.svg';
import Poin2 from '../../../assets/cake/Poin2.svg';
import { getRoomState, setRoomCallbacks, clearRoomCallbacks, resetRoomState } from '../../../lib/roomStore';
import PlayerDisconnectAlert from '../../../components/PlayerDisconnectAlert';
import { globalAudio } from '../../../lib/audioManager';
import type { GameOverPayload, RewardAssignedPayload } from '../../../lib/api';

import { fetchPartyRoomUserProfile } from '../../../lib/api';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MisuIcon from '../../../assets/profile-pic/Misu-Icon.svg';
import MochiIcon from '../../../assets/profile-pic/Mochi-Icon.svg';
import YukiIcon from '../../../assets/profile-pic/Yuki-Icon.svg';
import CakeInstructionsModal from '../../../components/CakeInstructionsModal';

import Cinamon from '../../../assets/flappybird/characters/Cinamon.svg';
import Koya from '../../../assets/flappybird/characters/Koya.svg';
import Misu from '../../../assets/flappybird/characters/Misu.svg';
import Mochi from '../../../assets/flappybird/characters/Mochi.svg';
import MyMelody from '../../../assets/flappybird/characters/MyMelody.svg';
import Nami from '../../../assets/flappybird/characters/Nami.svg';
import Tata from '../../../assets/flappybird/characters/Tata.svg';
import Yuki from '../../../assets/flappybird/characters/Yuki.svg';
import Zoro from '../../../assets/flappybird/characters/Zoro.svg';

const CHARACTER_MAP: Record<string, string> = {
    cinamon: Cinamon,
    koya: Koya,
    misu: Misu,
    mochi: Mochi,
    mymelody: MyMelody,
    nami: Nami,
    tata: Tata,
    yuki: Yuki,
    zoro: Zoro,
};

const CakeGame: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);
    const [gamePhase, setGamePhase] = useState<"instructions" | "alert" | "line" | "playing">("instructions");
    const [profileIcon, setProfileIcon] = useState<string>(MochiIcon);
    const [gameEndTime, setGameEndTime] = useState<number | null>(() => getRoomState().gameEndTime);
    const [timeRemaining, setTimeRemaining] = useState<number>(() => getRoomState().timeRemaining || 60);
    const [firingP1, setFiringP1] = useState(false);
    const [firingP2, setFiringP2] = useState(false);
    const [flyingCakes, setFlyingCakes] = useState<Array<{ id: number; fromP1: boolean }>>([]);
    const [pointPopups, setPointPopups] = useState<Array<{ id: number; forP1: boolean }>>([]);
    const cakeIdRef = useRef(0);
    const [showDisconnectAlert, setShowDisconnectAlert] = useState(false);

    useEffect(() => {
        globalAudio.pause();
        return () => {
            globalAudio.play();
        };
    }, []);

    useEffect(() => {
        void fetchPartyRoomUserProfile().then((profile) => {
            const char = (profile?.character_selected || "").toLowerCase();
            if (char === "misu") setProfileIcon(MisuIcon);
            else if (char === "yuki") setProfileIcon(YukiIcon);
            else setProfileIcon(MochiIcon);
        });
    }, []);

    useEffect(() => {
        if (gamePhase === "instructions") {
            return;
        } else if (gamePhase === "alert") {
            const t = setTimeout(() => setGamePhase("line"), 4000);
            return () => clearTimeout(t);
        } else if (gamePhase === "line") {
            const t = setTimeout(() => setGamePhase("playing"), 9000);
            return () => clearTimeout(t);
        }
    }, [gamePhase]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (error) { console.error(error); }
        };
        startCamera();
        document.body.style.overflow = 'hidden';
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Sync gameEndTime from server (survives screen lock / tab throttling)
    useEffect(() => {
        const { socket } = getRoomState();
        if (!socket) return;

        const syncEndTime = (endTime?: number) => {
            if (endTime) setGameEndTime(endTime);
        };

        if (getRoomState().gameEndTime) setGameEndTime(getRoomState().gameEndTime);

        const onGameStart = (payload: { gameEndTime?: number }) => syncEndTime(payload.gameEndTime);
        const onTimerTick = (data: { remaining: number; gameEndTime?: number }) => {
            setTimeRemaining(data.remaining);
            syncEndTime(data.gameEndTime);
        };

        socket.on('game_start', onGameStart);
        socket.on('game_timer_tick', onTimerTick);

        return () => {
            socket.off('game_start', onGameStart);
            socket.off('game_timer_tick', onTimerTick);
        };
    }, []);

    useEffect(() => {
        const { socket } = getRoomState();
        if (!socket) return;

        socketRef.current = socket as unknown as Socket;

        const handlePlayerDisconnect = () => {
            setShowDisconnectAlert(true);
            setGamePhase("instructions"); // Stop any active game updates / phases

            const roomId = getRoomState().roomId;
            setTimeout(() => {
                if (socket) {
                    socket.emit("room__close", { roomId });
                    setTimeout(() => {
                        socket.disconnect();
                    }, 100);
                }
                resetRoomState();
                navigate("/home");
            }, 3000);
        };

        if (socket) {
            socket.on("player_left", handlePlayerDisconnect);
            socket.on("player_disconnected", handlePlayerDisconnect);
        }

        setRoomCallbacks({
            onScoreUpdate: (userId, score) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                if (p1 && userId === p1.userId) setP1Score(score);
                if (p2 && userId === p2.userId) setP2Score(score);
            },
            onTimerTick: (remaining) => {
                // Sincronización alternativa vía callback global por si acaso
                setTimeRemaining(remaining);
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                if (p1) setP1Score(room.scores[p1.userId] ?? 0);
                if (p2) setP2Score(room.scores[p2.userId] ?? 0);
            },
            onGameAction: (data) => {
                if (data.action === "catapult_fire") {
                    const room = getRoomState();
                    const player = room.players.find(p => p.userId === data.userId);
                    if (!player) return;
                    const isP1 = player.role === "P1";
                    const id = cakeIdRef.current++;
                    if (isP1) setFiringP1(true);
                    else setFiringP2(true);
                    setFlyingCakes(prev => [...prev, { id, fromP1: isP1 }]);
                    setPointPopups(prev => [...prev, { id, forP1: isP1 }]);
                    setTimeout(() => {
                        if (isP1) setFiringP1(false);
                        else setFiringP2(false);
                        setFlyingCakes(prev => prev.filter(c => c.id !== id));
                        setPointPopups(prev => prev.filter(p => p.id !== id));
                        const currentScore = room.scores[player.userId] ?? 0;
                        const newScore = currentScore + 10;
                        const socket = room.socket;
                        if (socket) {
                            socket.emit("player_action", {
                                userId: player.userId,
                                characterId: player.characterId,
                                action: "score_update",
                                payload: { score: newScore },
                                roomId: room.roomId,
                                timestamp: Date.now(),
                            });
                        }
                        if (isP1) setP1Score(newScore);
                        else setP2Score(newScore);
                    }, 2200);
                }
            },
            onGameOver: (payload: GameOverPayload) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                const p1Score = p1 ? (payload.scores[p1.userId] ?? 0) : 0;
                const p2Score = p2 ? (payload.scores[p2.userId] ?? 0) : 0;

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: payload.roomId,
                        isDraw: payload.isDraw ?? false,
                        winnerPlayer: (p1 && payload.winnerId === p1.userId ? 1 : 2) as 1 | 2,
                        winnerName: (p1 && payload.winnerId === p1.userId ? p1 : p2)?.username ?? "Player",
                        player1Name: p1?.username ?? "Player 1",
                        player2Name: p2?.username ?? "Player 2",
                        player1Score: p1Score,
                        player2Score: p2Score,
                        player1UserId: p1?.userId,
                        player2UserId: p2?.userId,
                        player1CharacterId: p1?.characterId,
                        player2CharacterId: p2?.characterId,
                    },
                });
            },
            onRewardAssigned: (payload: RewardAssignedPayload) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                const winnerPlayer = (p1 && payload.userId === p1.userId ? 1 : 2) as 1 | 2;
                const winnerName = (p1 && payload.userId === p1.userId ? p1 : p2)?.username ?? "Player";
                const p1Score = room.scores[p1?.userId ?? ""] ?? 0;
                const p2Score = room.scores[p2?.userId ?? ""] ?? 0;

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: room.roomId,
                        isDraw: p1Score === p2Score,
                        winnerPlayer,
                        winnerName,
                        player1Name: p1?.username ?? "Player 1",
                        player2Name: p2?.username ?? "Player 2",
                        player1Score: p1Score,
                        player2Score: p2Score,
                        rewardName: payload.rewardName,
                        player1UserId: p1?.userId,
                        player2UserId: p2?.userId,
                        player1CharacterId: p1?.characterId,
                        player2CharacterId: p2?.characterId,
                    },
                });
            },
        });

        return () => {
            if (socket) {
                socket.off("player_left", handlePlayerDisconnect);
                socket.off("player_disconnected", handlePlayerDisconnect);
            }
            clearRoomCallbacks();
        };
    }, [navigate]);

    const handleStart = useCallback(() => {
        setGamePhase("alert");
        const socket = socketRef.current;
        const { roomId } = getRoomState();
        if (socket && roomId) {
            socket.emit("start_game_clock", { roomId });
        }
    }, []);

    const roomState = getRoomState();
    const p1 = roomState.players.find(p => p.role === "P1");
    const p2 = roomState.players.find(p => p.role === "P2");

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0"
            />

            <style>{`
                @keyframes cake-fly-p1 {
                    0% { left: 6%; bottom: 22%; transform: rotate(0deg) scale(0.8); opacity: 1; }
                    30% { left: 30%; bottom: 55%; transform: rotate(120deg) scale(1.1); }
                    60% { left: 55%; bottom: 40%; transform: rotate(240deg); }
                    100% { left: 80%; bottom: 50%; transform: rotate(360deg) scale(0.9); opacity: 1; }
                }
                @keyframes cake-fly-p2 {
                    0% { right: 6%; bottom: 22%; transform: rotate(0deg) scale(0.8); opacity: 1; }
                    30% { right: 30%; bottom: 55%; transform: rotate(120deg) scale(1.1); }
                    60% { right: 55%; bottom: 40%; transform: rotate(240deg); }
                    100% { right: 80%; bottom: 50%; transform: rotate(360deg) scale(0.9); opacity: 1; }
                }
                @keyframes float-up {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-120px) scale(1.2); }
                }
                .animate-cake-p1 { animation: cake-fly-p1 1.2s ease-in-out forwards; }
                .animate-cake-p2 { animation: cake-fly-p2 1.2s ease-in-out forwards; }
                .animate-float-up { animation: float-up 1.5s ease-out forwards; }
                @keyframes alert-anim {
                    0% { opacity: 0; transform: scale(0.85); }
                    10% { opacity: 1; transform: scale(1); }
                    90% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.95); }
                }
                @keyframes line-anim {
                    0% { opacity: 0; }
                    10% { opacity: 1; }
                    25% { opacity: 0.2; }
                    40% { opacity: 1; }
                    55% { opacity: 0.2; }
                    70% { opacity: 1; }
                    85% { opacity: 0.2; }
                    90% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes bounce-left {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-20px); }
                }
                @keyframes bounce-right {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(20px); }
                }
            `}</style>

            {gamePhase === "instructions" && (
                <CakeInstructionsModal onStart={handleStart} />
            )}

            {gamePhase === "alert" && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-5" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
                    <div
                        className="flex w-full max-w-140 flex-col items-center rounded-[40px] bg-[#FAFAFA] p-10 pb-12 text-center shadow-2xl"
                        style={{ animation: "alert-anim 5s forwards" }}
                    >
                        <div className="mb-8 flex items-center justify-center gap-8">
                            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[#71D0FF]">
                                <img src={profileIcon} alt="Player 1" className="h-full w-full object-cover" />
                            </div>
                            <div className="h-35 w-1 shrink-0 rounded-full bg-[#ED1C24]" />
                            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[#8E44AD]">
                                <img src={profileIcon} alt="Player 2" className="h-full w-full object-cover" />
                            </div>
                        </div>
                        <h2 className="mb-5 text-[34px] font-extrabold text-[#ED1C24] leading-tight" style={{ fontFamily: "'Baloo 2', cursive" }}>Keep Your Distance</h2>
                        <p className="text-[20px] font-semibold text-[#583921] leading-[1.4]">
                            Take your positions on opposite sides of the screen, separated by the line, then shout into the phone.
                        </p>
                    </div>
                </div>
            )}

            {gamePhase === "line" && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    style={{ animation: "line-anim 3s forwards" }}
                >
                    <div className="relative flex items-center justify-center h-[84%] w-full">
                        <div className="absolute right-1/2 mr-10" style={{ animation: "bounce-left 1s infinite" }}>
                            <ArrowLeft color="#ED1C24" size={200} strokeWidth={2.5} />
                        </div>

                        <div className="w-1.25 h-full rounded-full bg-[#ED1C24]" />

                        <div className="absolute left-1/2 ml-10" style={{ animation: "bounce-right 1s infinite" }}>
                            <ArrowRight color="#ED1C24" size={200} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            )}

            {/* Contadores de puntos */}
            {gamePhase !== "instructions" && (
                <>
                    <div className="fixed top-8 left-[80px] z-30">
                        <GamePoints points={p1Score} playerRole="P1" />
                    </div>
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-30">
                        {gameEndTime && (
                            <Timer initialSeconds={60} remaining={timeRemaining} />
                        )}
                    </div>
                    <div className="fixed top-8 right-[80px] z-30">
                        <GamePoints points={p2Score} playerRole="P2" />
                    </div>
                </>
            )}

            {/* Línea roja durante playing */}
            {gamePhase === "playing" && (
                <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                    <div className="w-1.25 h-[84%] rounded-full bg-[#ED1C24] opacity-25" />
                </div>
            )}

            {/* Personajes sobre catapultas */}
            {p1 && (
                <div className="fixed z-25" style={{ bottom: '380px', left: '240px' }}>
                    <img
                        src={CHARACTER_MAP[p1.characterId?.toLowerCase() ?? ''] ?? Mochi}
                        alt={p1.username}
                        className="w-20 h-20 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                    />
                    <span className="block text-center text-xs font-bold text-white bg-black/50 rounded-full px-2 py-0.5 mt-1">
                        {p1.username}
                    </span>
                </div>
            )}
            {p2 && (
                <div className="fixed z-25" style={{ bottom: '380px', right: '240px' }}>
                    <img
                        src={CHARACTER_MAP[p2.characterId?.toLowerCase() ?? ''] ?? Mochi}
                        alt={p2.username}
                        className="w-20 h-20 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
                    />
                    <span className="block text-center text-xs font-bold text-white bg-black/50 rounded-full px-2 py-0.5 mt-1">
                        {p2.username}
                    </span>
                </div>
            )}

            {/* Pasteles voladores */}
            {flyingCakes.map(cake => (
                <img
                    key={cake.id}
                    src={pastelazo}
                    alt=""
                    className={`fixed z-30 w-24 h-24 pointer-events-none ${cake.fromP1 ? 'animate-cake-p1' : 'animate-cake-p2'}`}
                />
            ))}

            {/* Popups de puntos flotando */}
            {pointPopups.map(popup => (
                <div
                    key={popup.id}
                    className="fixed z-40 flex flex-col items-center pointer-events-none animate-float-up"
                    style={{
                        bottom: '360px',
                        left: popup.forP1 ? '220px' : 'auto',
                        right: popup.forP1 ? 'auto' : '220px',
                    }}
                >
                    <img
                        src={popup.forP1 ? Point1 : Poin2}
                        alt=""
                        className="w-14 h-14 object-contain"
                    />
                    <span
                        className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                        style={{ marginTop: '-6px', fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                    >
                        +10
                    </span>
                </div>
            ))}

            {/* Catapulta derecha (P2) — normal: Catapulta, disparando: Catapulta3 */}
            <img
                src={firingP2 ? CatapultaThree : Catapulta}
                alt="Catapulta P2"
                className="fixed bottom-0 right-10 z-20 w-110 pointer-events-none"
            />

            {/* Catapulta izquierda (P1) — normal: Catapulta2, disparando: Catapulta4 */}
            <img
                src={firingP1 ? CatapultaFour : CatapultaTwo}
                alt="Catapulta P1"
                className="fixed bottom-0 left-10 z-20 w-110 pointer-events-none"
            />
            <iframe
                width="0" height="0"
                src="https://www.youtube.com/embed/kYmZ64g3s3E?autoplay=1&loop=1&playlist=kYmZ64g3s3E"
                allow="autoplay" className="hidden" title="Background Music"
            />
            <PlayerDisconnectAlert isOpen={showDisconnectAlert} />
        </div>
    );
};

export default CakeGame;