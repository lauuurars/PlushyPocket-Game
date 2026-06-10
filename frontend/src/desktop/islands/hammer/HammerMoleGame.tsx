import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type { ActiveCharacter, Character, Position, Side } from '../../../types/hammerTypes';
import type { GameOverPayload, RewardAssignedPayload } from '../../../lib/api';
import { clearRoomCallbacks, getRoomState, setRoomCallbacks, resetRoomState } from '../../../lib/roomStore';
import PlayerDisconnectAlert from '../../../components/PlayerDisconnectAlert';
import { globalAudio } from '../../../lib/audioManager';
import partedearriba from '../../../assets/marcoHammerMole/partedearriba.svg';
import partedeabajo from '../../../assets/marcoHammerMole/partedeabajotopos.svg';
import ladoizquierdo from '../../../assets/marcoHammerMole/ladoizquierdotopos.svg';
import cinnamoroll from '../../../assets/marcoHammerMole/cinnamoroll.svg';
import kuromi from '../../../assets/marcoHammerMole/kuromi.svg';
import myMelody from '../../../assets/marcoHammerMole/myMelody.svg';
import pompompurin from '../../../assets/marcoHammerMole/pompompurin.svg';
import Point1 from '../../../assets/cake/Point1.svg';
import Poin2 from '../../../assets/cake/Poin2.svg';
import GamePoints from '../../../components/GamePoints';
import Timer from '../../../components/Timer';
import HammerInstructionsModal from '../../../components/HammerInstructionsModal';

const charactersList: Character[] = [
    { name: 'Cinnamoroll', image: cinnamoroll },
    { name: 'Kuromi', image: kuromi },
    { name: 'My Melody', image: myMelody },
    { name: 'Pompompurin', image: pompompurin },
];
// offset: Empuja al personaje para que el marco no le tape la cara
const SIDE_CONFIG: Record<Side, { rotation: number, offset: string, ranges: number[][], anim: string }> = {
    top: { rotation: 180, offset: '40px', ranges: [[40, 60]], anim: 'popTop' },
    bottom: { rotation: 0, offset: '35px', ranges: [[40, 60]], anim: 'popBottom' },
    left: { rotation: 90, offset: '25px', ranges: [[40, 60]], anim: 'popLeft' },
    right: { rotation: -90, offset: '25px', ranges: [[40, 60]], anim: 'popRight' },
    'top-left': { rotation: 135, offset: '120px', ranges: [[5, 12]], anim: 'popDiagTL' },
    'top-right': { rotation: 225, offset: '120px', ranges: [[5, 12]], anim: 'popDiagTR' },
    'bottom-left': { rotation: 45, offset: '160px', ranges: [[5, 12]], anim: 'popDiagBL' },
    'bottom-right': { rotation: -45, offset: '160px', ranges: [[5, 12]], anim: 'popDiagBR' },
};

const ALL_SIDES: Side[] = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

function getRandomFromRanges(ranges: number[][]): string {
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    return (range[0] + Math.random() * (range[1] - range[0])) + '%';
}

function buildPosition(side: Side): Position {
    const config = SIDE_CONFIG[side];
    const randomPos = getRandomFromRanges(config.ranges);
    if (side === 'top') return { top: config.offset, left: randomPos };
    if (side === 'bottom') return { bottom: config.offset, left: randomPos };
    if (side === 'left') return { left: config.offset, top: randomPos };
    if (side === 'right') return { right: config.offset, top: randomPos };
    if (side === 'top-left') return { top: config.offset, left: config.offset };
    if (side === 'top-right') return { top: config.offset, right: config.offset };
    if (side === 'bottom-left') return { bottom: config.offset, left: config.offset };
    if (side === 'bottom-right') return { bottom: config.offset, right: config.offset };
    return {};
}

// Genera un topo nuevo que no repita personaje ni lado de los actuales
function spawnOne(usedSides: Side[], usedCharNames: string[]): ActiveCharacter {
    const availableSides = ALL_SIDES.filter(s => !usedSides.includes(s));
    const availableChars = charactersList.filter(c => !usedCharNames.includes(c.name));

    const side = availableSides[Math.floor(Math.random() * availableSides.length)];
    const char = availableChars[Math.floor(Math.random() * availableChars.length)];

    return {
        id: Math.random(),
        character: char,
        position: buildPosition(side),
        side,
    };
}

// Genera los 3 topos iniciales sin repetir personaje ni lado
function spawnInitial(): ActiveCharacter[] {
    const result: ActiveCharacter[] = [];
    for (let i = 0; i < 3; i++) {
        const usedSides = result.map(c => c.side);
        const usedChars = result.map(c => c.character.name);
        result.push(spawnOne(usedSides, usedChars));
    }
    return result;
}

const HammerMoleGame: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const activeCharactersRef = useRef<ActiveCharacter[]>([]);
    const gameStartedRef = useRef(false);

    const [activeCharacters, setActiveCharacters] = useState<ActiveCharacter[]>([]);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);
    const [gameEndTime, setGameEndTime] = useState<number | null>(() => getRoomState().gameEndTime);
    const [showDisconnectAlert, setShowDisconnectAlert] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(() => getRoomState().timeRemaining || 60);
    const [showInstructions, setShowInstructions] = useState(true);
    const [pointPopups, setPointPopups] = useState<Array<{ id: number; position: React.CSSProperties; forP1: boolean }>>([]);

    // Pausar música de fondo del home al entrar y reanudar al salir
    useEffect(() => {
        globalAudio.pause();
        return () => {
            globalAudio.play();
        };
    }, []);

    // Mantener ref sincronizado para leerlo dentro del socket handler
    useEffect(() => {
        activeCharactersRef.current = activeCharacters;
    }, [activeCharacters]);

    // Reemplaza un topo golpeado por uno nuevo sin repetir lado ni personaje
    const replaceCharacter = useCallback((hitId: number) => {
        setActiveCharacters(prev => {
            const remaining = prev.filter(c => c.id !== hitId);
            const usedSides = remaining.map(c => c.side);
            const usedChars = remaining.map(c => c.character.name);
            const newOne = spawnOne(usedSides, usedChars);
            return [...remaining, newOne];
        });
    }, []);

    // Cámara
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

    // Socket — reutiliza la conexión de PartyRoom y escucha golpes del celular
    useEffect(() => {
        const { socket } = getRoomState();
        if (!socket) return;

        socketRef.current = socket as unknown as Socket;
        socket.emit("screen__join_room", { roomId: getRoomState().roomId });

        const handleGameAction = (data: {
            userId: string;
            action: string;
            payload: { direction?: string; hits?: number; currentScore?: number };
        }) => {
            if (data.action !== 'score_update') return;
            if (!data.payload?.direction) return;
            if (!gameStartedRef.current) return;

            const { direction } = data.payload;
            const current = activeCharactersRef.current;
            const hit = current.find(c => c.side === direction && !c.isHit);
            if (!hit) return;

            // Mark as hit immediately to prevent double-hits and show red visual effect
            hit.isHit = true;
            setActiveCharacters(prev =>
                prev.map(c => c.id === hit.id ? { ...c, isHit: true } : c)
            );

            const room = getRoomState();
            const p1 = room.players.find(p => p.role === 'P1');
            const p2 = room.players.find(p => p.role === 'P2');

            // Popup sobre el personaje golpeado
            const isP1 = data.userId === p1?.userId;
            const popupId = Date.now();
            setPointPopups(prev => [...prev, { id: popupId, position: hit.position, forP1: isP1 }]);
            setTimeout(() => {
                setPointPopups(prev => prev.filter(p => p.id !== popupId));
            }, 1500);

            if (data.userId === p1?.userId) setP1Score(prev => prev + 5);
            if (data.userId === p2?.userId) setP2Score(prev => prev + 5);

            setTimeout(() => {
                replaceCharacter(hit.id);
            }, 300);

            socket.emit('hit_confirmed', {
                userId: data.userId,
                characterName: hit.character.name,
                points: 5,
            });
        };

        const handlePlayerDisconnect = () => {
            setShowDisconnectAlert(true);
            gameStartedRef.current = false;
            setActiveCharacters([]);

            const room = getRoomState();
            const roomId = room.roomId;
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

        socket.on('player_left', handlePlayerDisconnect);
        socket.on('player_disconnected', handlePlayerDisconnect);

        socket.on('game_action', handleGameAction);

        setRoomCallbacks({
            onGameOver: (payload: GameOverPayload) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === 'P1');
                const p2 = room.players.find(p => p.role === 'P2');
                const p1Score = p1 ? (payload.scores[p1.userId] ?? 0) : 0;
                const p2Score = p2 ? (payload.scores[p2.userId] ?? 0) : 0;

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: payload.roomId,
                        isDraw: payload.isDraw ?? false,
                        winnerPlayer: (p1 && payload.winnerId === p1.userId ? 1 : 2) as 1 | 2,
                        winnerName: payload.isDraw ? 'Draw!' : (p1 && payload.winnerId === p1.userId ? p1 : p2)?.username ?? 'Player',
                        player1Name: p1?.username ?? 'Player 1',
                        player2Name: p2?.username ?? 'Player 2',
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
                const p1 = room.players.find(p => p.role === 'P1');
                const p2 = room.players.find(p => p.role === 'P2');
                const winnerPlayer = (p1 && payload.userId === p1.userId ? 1 : 2) as 1 | 2;
                const winnerName = (p1 && payload.userId === p1.userId ? p1 : p2)?.username ?? 'Player';
                const p1Score = room.scores[p1?.userId ?? ''] ?? 0;
                const p2Score = room.scores[p2?.userId ?? ''] ?? 0;

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: room.roomId,
                        isDraw: p1Score === p2Score,
                        winnerPlayer,
                        winnerName,
                        player1Name: p1?.username ?? 'Player 1',
                        player2Name: p2?.username ?? 'Player 2',
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
            socket.off('game_action', handleGameAction);
            socket.off('player_left', handlePlayerDisconnect);
            socket.off('player_disconnected', handlePlayerDisconnect);
            clearRoomCallbacks();
        };
    }, [replaceCharacter, navigate]);

    // Spawn inicial al arrancar el juego
    const handleStart = useCallback(() => {
        setShowInstructions(false);
        gameStartedRef.current = true;
        setActiveCharacters(spawnInitial());

        const socket = socketRef.current;
        const { roomId } = getRoomState();
        if (socket && roomId) {
            socket.emit("start_game_clock", { roomId });
        }
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <style>{`
                @keyframes popTop    { 0%, 100% { transform: translateY(-130%); opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popBottom { 0%, 100% { transform: translateY(130%);  opacity: 0; } 25%, 75% { transform: translateY(0); opacity: 1; } }
                @keyframes popLeft   { 0%, 100% { transform: translateX(-130%); opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popRight  { 0%, 100% { transform: translateX(130%);  opacity: 0; } 25%, 75% { transform: translateX(0); opacity: 1; } }
                @keyframes popDiagTL { 0%, 100% { transform: translate(-100%, -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagTR { 0%, 100% { transform: translate(100%,  -100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBL { 0%, 100% { transform: translate(-100%,  100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                @keyframes popDiagBR { 0%, 100% { transform: translate(100%,   100%); opacity: 0; } 25%, 75% { transform: translate(0, 0); opacity: 1; } }
                .char-anim { animation-duration: 1.5s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
                .char-hit-red {
                    filter: sepia(1) saturate(20) hue-rotate(-50deg) brightness(0.8) drop-shadow(0 0 20px #ff0000);
                    transition: filter 0.1s ease-in-out;
                }

                @keyframes float-up {
                    0%   { opacity: 1; transform: translateY(0)     scale(1);   }
                    100% { opacity: 0; transform: translateY(-80px) scale(1.2); }
                }
                .animate-float-up { animation: float-up 1.5s ease-out forwards; }
            `}</style>

            <video ref={videoRef} autoPlay playsInline className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0" />

            {!showInstructions && (
                <>
                    <div className="fixed top-6 left-20 z-30">
                        <GamePoints points={p1Score} playerRole="P1" />
                    </div>
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
                        {gameEndTime && (
                            <Timer initialSeconds={60} remaining={timeRemaining} />
                        )}
                    </div>
                    <div className="fixed top-6 right-20 z-30">
                        <GamePoints points={p2Score} playerRole="P2" />
                    </div>
                </>
            )}

            {showInstructions && (
                <HammerInstructionsModal onStart={handleStart} />
            )}

            {activeCharacters.map((active) => {
                const config = SIDE_CONFIG[active.side];
                return (
                    <div
                        key={active.id}
                        className="absolute char-anim flex items-center justify-center"
                        style={{
                            ...active.position,
                            width: 'auto',
                            height: '180px',
                            minWidth: '180px',
                            zIndex: 5,
                            animationName: config.anim,
                            transformOrigin: 'center',
                            overflow: 'visible',
                        }}
                    >
                        <img
                            src={active.character.image}
                            alt={active.character.name}
                            className={`h-full w-auto object-contain ${active.isHit ? 'char-hit-red' : ''}`}
                            style={{ transform: `rotate(${config.rotation}deg)`, transformOrigin: 'center' }}
                        />
                    </div>
                );
            })}

            {pointPopups.map(popup => (
                <div
                    key={popup.id}
                    className="absolute z-40 flex flex-col items-center pointer-events-none animate-float-up"
                    style={{
                        ...popup.position,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="relative flex items-center justify-center">
                        <img
                            src={popup.forP1 ? Point1 : Poin2}
                            alt=""
                            className="w-40 h-40 object-contain"
                        />
                        <span
                            className="absolute pb-1 text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                            style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                        >
                            +5
                        </span>
                    </div>
                </div>
            ))}

            <img src={partedearriba} alt="Marco Superior" className="fixed -top-35 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={partedeabajo} alt="Marco Inferior" className="fixed -bottom-30 left-0 w-screen h-auto z-20 pointer-events-none" />
            <img src={ladoizquierdo} alt="Marco Izquierdo" className="fixed top-0 -left-2.5 h-screen w-auto z-10 pointer-events-none" />

            <iframe
                width="0" height="0"
                src="https://www.youtube.com/embed/pxDHwSwDMr0?autoplay=1&loop=1&playlist=pxDHwSwDMr0"
                allow="autoplay" className="hidden" title="Background Music"
            />
            <PlayerDisconnectAlert isOpen={showDisconnectAlert} />
        </div>
    );
};

export default HammerMoleGame;