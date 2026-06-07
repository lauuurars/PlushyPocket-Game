import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ocean from './Ocean';
import type { ObstacleData, Column } from '../../../types/flappyTypes';
import { getRoomState, setRoomCallbacks, clearRoomCallbacks } from '../../../lib/roomStore';
import type { GameOverPayload, RewardAssignedPayload } from '../../../lib/api';

// Assets
import boatPart from '../../../assets/flappybird/boatPart.svg';
import boatPart2 from '../../../assets/flappybird/boatPart2.svg';
import woodenbench from '../../../assets/flappybird/woodenbench.svg';
import woodenbench2 from '../../../assets/flappybird/woodenbench2.svg';
import woodenbench3 from '../../../assets/flappybird/woodenbench3.svg';
import Timer from '../../../components/Timer';

// Characters
import Cinamon from '../../../assets/flappybird/characters/Cinamon.svg';
import Koya from '../../../assets/flappybird/characters/Koya.svg';
import Misu from '../../../assets/flappybird/characters/Misu.svg';
import Mochi from '../../../assets/flappybird/characters/Mochi.svg';
import MyMelody from '../../../assets/flappybird/characters/MyMelody.svg';
import Nami from '../../../assets/flappybird/characters/Nami.svg';
import Tata from '../../../assets/flappybird/characters/Tata.svg';
import Yuki from '../../../assets/flappybird/characters/Yuki.svg';
import Zoro from '../../../assets/flappybird/characters/Zoro.svg';

const ASSETS = [boatPart, boatPart2, woodenbench, woodenbench2, woodenbench3];
const CHARACTERS = [Cinamon, Koya, Misu, Mochi, MyMelody, Nami, Tata, Yuki, Zoro];
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

const FlappyGame: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number | null>(null);

    // Get room players and scores
    const roomState = getRoomState();
    const p1 = roomState.players.find(p => p.role === "P1");
    const p2 = roomState.players.find(p => p.role === "P2");

    // Scores
    const [p1Score, setP1Score] = useState(() => (p1 ? (roomState.scores[p1.userId] ?? 0) : 0));
    const [p2Score, setP2Score] = useState(() => (p2 ? (roomState.scores[p2.userId] ?? 0) : 0));
    const p1ScoreRef = useRef(p1 ? (roomState.scores[p1.userId] ?? 0) : 0);
    const p2ScoreRef = useRef(p2 ? (roomState.scores[p2.userId] ?? 0) : 0);

    // Physics state
    const [p1Y, setP1Y] = useState(400);
    const [p2Y, setP2Y] = useState(400);
    const p1YRef = useRef(400);
    const p2YRef = useRef(400);
    const p1VelRef = useRef(0);
    const p2VelRef = useRef(0);

    // Invincibility
    const [p1Invincible, setP1Invincible] = useState(false);
    const [p2Invincible, setP2Invincible] = useState(false);
    const p1InvincibleRef = useRef(false);
    const p2InvincibleRef = useRef(false);

    // Passed columns tracking
    const passedColumnsP1 = useRef<Set<number>>(new Set());
    const passedColumnsP2 = useRef<Set<number>>(new Set());

    // Characters assignment
    const [p1Char] = useState(() => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);
    const [p2Char] = useState(() => {
        let char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        let attempts = 0;
        while (char === p1Char && attempts < 10) {
            char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            attempts++;
        }
        return char;
    });

    // Configuración Estricta
    const SPEED = 2;
    const MIN_HORIZONTAL_SPACING = 450;
    const OBSTACLE_COUNT = 5;
    const VERTICAL_GAP = 400;
    const BASE_HEIGHT = 300;
    const BIRD_WIDTH = 70;
    const BIRD_HEIGHT = 70;
    const P1_X = 250;
    const P2_X = 370;

    const GRAVITY = 0.15;
    const JUMP_FORCE = -8;

    const getAssetData = (typeIndex: number, position: 'top' | 'bottom'): ObstacleData => {
        const isBoat = typeIndex === 0 || typeIndex === 1;
        const isNormalBench = typeIndex === 2;
        const isClippedBench = typeIndex === 3 || typeIndex === 4;

        let rotation = 0;
        if ((isBoat || isNormalBench) && position === 'top') rotation = 180;
        if (isClippedBench && position === 'bottom') rotation = 180;

        const width = typeIndex === 0 ? 450 : 320;

        let finalTopPos = -20;
        if (typeIndex === 0 && position === 'top') {
            finalTopPos = -120;
        }
        if (typeIndex === 2 && position === 'top') {
            finalTopPos = -40;
        }

        return {
            typeIndex,
            rotation,
            width,
            height: BASE_HEIGHT,
            [position === 'top' ? 'topPos' : 'bottomPos']: position === 'top' ? finalTopPos : -20
        };
    };

    const generateColumn = (id: number, x: number, prevPos?: 'top' | 'bottom'): Column => {
        const viewportHeight = window.innerHeight;
        const canFitTwo = (BASE_HEIGHT * 2 + VERTICAL_GAP) <= viewportHeight;

        let targetPos: 'top' | 'bottom';
        if (!prevPos) {
            targetPos = Math.random() > 0.5 ? 'top' : 'bottom';
        } else {
            targetPos = prevPos === 'top' ? 'bottom' : 'top';
        }

        const isDouble = canFitTwo && Math.random() > 0.7;

        let top: ObstacleData | undefined;
        let bottom: ObstacleData | undefined;

        if (isDouble) {
            top = getAssetData(Math.floor(Math.random() * ASSETS.length), 'top');
            bottom = getAssetData(Math.floor(Math.random() * ASSETS.length), 'bottom');

            const topFinalEdge = BASE_HEIGHT + (top.topPos || 0);
            bottom.bottomPos = undefined;
            bottom.topPos = topFinalEdge + VERTICAL_GAP;
        } else {
            const typeIndex = Math.floor(Math.random() * ASSETS.length);
            if (targetPos === 'top') top = getAssetData(typeIndex, 'top');
            else bottom = getAssetData(typeIndex, 'bottom');
        }

        return { id, x, top, bottom, lastPosUsed: targetPos };
    };

    const [columns, setColumns] = useState<Column[]>(() => {
        const startX = window.innerWidth + 200;
        let lastSide: 'top' | 'bottom' | undefined;

        return Array.from({ length: OBSTACLE_COUNT }, (_, i) => {
            const col = generateColumn(i, startX + (i * MIN_HORIZONTAL_SPACING), lastSide);
            lastSide = col.lastPosUsed;
            return col;
        });
    });

    const emitScoreUpdate = (userId: string, characterId: string, newScore: number) => {
        const socket = getRoomState().socket;
        if (socket) {
            socket.emit("player_action", {
                userId,
                characterId,
                action: "score_update",
                payload: { score: newScore },
                roomId: getRoomState().roomId,
                timestamp: Date.now()
            });
        }
    };

    const checkCollision = (birdX: number, birdY: number, col: Column): boolean => {
        const obstacleWidth = col.top?.width ?? col.bottom?.width ?? 320;
        const horizontalOverlap = col.x < birdX + BIRD_WIDTH && col.x + obstacleWidth > birdX;
        if (!horizontalOverlap) return false;

        if (col.top) {
            const topEdge = (col.top.topPos ?? 0) + BASE_HEIGHT;
            if (birdY < topEdge) return true;
        }

        if (col.bottom) {
            if (col.bottom.topPos !== undefined) {
                const bottomEdge = col.bottom.topPos;
                if (birdY + BIRD_HEIGHT > bottomEdge) return true;
            } else if (col.bottom.bottomPos !== undefined) {
                const bottomEdge = window.innerHeight - BASE_HEIGHT - col.bottom.bottomPos;
                if (birdY + BIRD_HEIGHT > bottomEdge) return true;
            }
        }

        return false;
    };

    const animate = () => {
        setColumns(prev => {
            const rightmostX = Math.max(...prev.map(c => c.x));
            const lastCol = prev.reduce((p, c) => (p.x > c.x ? p : c));

            return prev.map(col => {
                const newX = col.x - SPEED;
                if (newX < -500) {
                    passedColumnsP1.current.delete(col.id);
                    passedColumnsP2.current.delete(col.id);
                    return generateColumn(col.id, rightmostX + MIN_HORIZONTAL_SPACING, lastCol.lastPosUsed);
                }

                const obstacleWidth = col.top?.width ?? col.bottom?.width ?? 320;
                const colCenter = newX + obstacleWidth / 2;

                const room = getRoomState();
                const player1 = room.players.find(p => p.role === "P1");
                const player2 = room.players.find(p => p.role === "P2");

                if (player1 && colCenter < P1_X && !passedColumnsP1.current.has(col.id)) {
                    passedColumnsP1.current.add(col.id);
                    const newScore = p1ScoreRef.current + 1;
                    p1ScoreRef.current = newScore;
                    setP1Score(newScore);
                    emitScoreUpdate(player1.userId, player1.characterId, newScore);
                }

                if (player2 && colCenter < P2_X && !passedColumnsP2.current.has(col.id)) {
                    passedColumnsP2.current.add(col.id);
                    const newScore = p2ScoreRef.current + 1;
                    p2ScoreRef.current = newScore;
                    setP2Score(newScore);
                    emitScoreUpdate(player2.userId, player2.characterId, newScore);
                }

                if (player1 && !p1InvincibleRef.current && checkCollision(P1_X, p1YRef.current, col)) {
                    p1InvincibleRef.current = true;
                    setP1Invincible(true);

                    const newScore = Math.max(0, p1ScoreRef.current - 2);
                    p1ScoreRef.current = newScore;
                    setP1Score(newScore);
                    emitScoreUpdate(player1.userId, player1.characterId, newScore);

                    p1YRef.current = window.innerHeight / 2;
                    p1VelRef.current = 0;
                    setP1Y(p1YRef.current);

                    setTimeout(() => {
                        p1InvincibleRef.current = false;
                        setP1Invincible(false);
                    }, 1500);
                }

                if (player2 && !p2InvincibleRef.current && checkCollision(P2_X, p2YRef.current, col)) {
                    p2InvincibleRef.current = true;
                    setP2Invincible(true);

                    const newScore = Math.max(0, p2ScoreRef.current - 2);
                    p2ScoreRef.current = newScore;
                    setP2Score(newScore);
                    emitScoreUpdate(player2.userId, player2.characterId, newScore);

                    p2YRef.current = window.innerHeight / 2;
                    p2VelRef.current = 0;
                    setP2Y(p2YRef.current);

                    setTimeout(() => {
                        p2InvincibleRef.current = false;
                        setP2Invincible(false);
                    }, 1500);
                }

                return { ...col, x: newX };
            });
        });

        // Gravity & Ground checks
        const maxP1Y = window.innerHeight - BIRD_HEIGHT - 60;
        p1VelRef.current += GRAVITY;
        p1YRef.current += p1VelRef.current;
        if (p1YRef.current < 0) {
            p1YRef.current = 0;
            p1VelRef.current = 0;
        }
        if (p1YRef.current >= maxP1Y) {
            p1YRef.current = maxP1Y;
            p1VelRef.current = 0;

            const room = getRoomState();
            const player1 = room.players.find(p => p.role === "P1");
            if (player1 && !p1InvincibleRef.current) {
                p1InvincibleRef.current = true;
                setP1Invincible(true);

                const newScore = Math.max(0, p1ScoreRef.current - 2);
                p1ScoreRef.current = newScore;
                setP1Score(newScore);
                emitScoreUpdate(player1.userId, player1.characterId, newScore);

                p1YRef.current = window.innerHeight / 2;
                p1VelRef.current = 0;

                setTimeout(() => {
                    p1InvincibleRef.current = false;
                    setP1Invincible(false);
                }, 1500);
            }
        }
        setP1Y(p1YRef.current);

        const maxP2Y = window.innerHeight - BIRD_HEIGHT - 60;
        p2VelRef.current += GRAVITY;
        p2YRef.current += p2VelRef.current;
        if (p2YRef.current < 0) {
            p2YRef.current = 0;
            p2VelRef.current = 0;
        }
        if (p2YRef.current >= maxP2Y) {
            p2YRef.current = maxP2Y;
            p2VelRef.current = 0;

            const room = getRoomState();
            const player2 = room.players.find(p => p.role === "P2");
            if (player2 && !p2InvincibleRef.current) {
                p2InvincibleRef.current = true;
                setP2Invincible(true);

                const newScore = Math.max(0, p2ScoreRef.current - 2);
                p2ScoreRef.current = newScore;
                setP2Score(newScore);
                emitScoreUpdate(player2.userId, player2.characterId, newScore);

                p2YRef.current = window.innerHeight / 2;
                p2VelRef.current = 0;

                setTimeout(() => {
                    p2InvincibleRef.current = false;
                    setP2Invincible(false);
                }, 1500);
            }
        }
        setP2Y(p2YRef.current);

        requestRef.current = requestAnimationFrame(animate);
    };

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
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Set Socket Callbacks & Listeners
    useEffect(() => {
        setRoomCallbacks({
            onScoreUpdate: (userId, score) => {
                const room = getRoomState();
                const player1 = room.players.find(p => p.role === "P1");
                const player2 = room.players.find(p => p.role === "P2");
                if (player1 && userId === player1.userId) {
                    setP1Score(score);
                    p1ScoreRef.current = score;
                }
                if (player2 && userId === player2.userId) {
                    setP2Score(score);
                    p2ScoreRef.current = score;
                }
            },
            onTimerTick: () => {
                const room = getRoomState();
                const player1 = room.players.find(p => p.role === "P1");
                const player2 = room.players.find(p => p.role === "P2");
                if (player1) {
                    setP1Score(room.scores[player1.userId] ?? 0);
                    p1ScoreRef.current = room.scores[player1.userId] ?? 0;
                }
                if (player2) {
                    setP2Score(room.scores[player2.userId] ?? 0);
                    p2ScoreRef.current = room.scores[player2.userId] ?? 0;
                }
            },
            onGameAction: (data) => {
                if (data.action === "jump") {
                    const room = getRoomState();
                    const player1 = room.players.find(p => p.role === "P1");
                    const player2 = room.players.find(p => p.role === "P2");
                    if (player1 && data.userId === player1.userId) {
                        p1VelRef.current = JUMP_FORCE;
                    }
                    if (player2 && data.userId === player2.userId) {
                        p2VelRef.current = JUMP_FORCE;
                    }
                }
            },
            onGameOver: (payload: GameOverPayload) => {
                const room = getRoomState();
                const player1 = room.players.find(p => p.role === "P1");
                const player2 = room.players.find(p => p.role === "P2");
                const score1 = player1 ? (payload.scores[player1.userId] ?? 0) : 0;
                const score2 = player2 ? (payload.scores[player2.userId] ?? 0) : 0;

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: payload.roomId,
                        winnerPlayer: (player1 && payload.winnerId === player1.userId ? 1 : 2) as 1 | 2,
                        winnerName: (player1 && payload.winnerId === player1.userId ? player1 : player2)?.username ?? "Player",
                        player1Name: player1?.username ?? "Player 1",
                        player2Name: player2?.username ?? "Player 2",
                        player1Score: score1,
                        player2Score: score2,
                    },
                });
            },
            onRewardAssigned: (payload: RewardAssignedPayload) => {
                const room = getRoomState();
                const player1 = room.players.find(p => p.role === "P1");
                const player2 = room.players.find(p => p.role === "P2");
                const winnerPlayer = (player1 && payload.userId === player1.userId ? 1 : 2) as 1 | 2;
                const winnerName = (player1 && payload.userId === player1.userId ? player1 : player2)?.username ?? "Player";

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: room.roomId,
                        winnerPlayer,
                        winnerName,
                        player1Name: player1?.username ?? "Player 1",
                        player2Name: player2?.username ?? "Player 2",
                        player1Score: room.scores[player1?.userId ?? ""] ?? 0,
                        player2Score: room.scores[player2?.userId ?? ""] ?? 0,
                        rewardName: payload.rewardName,
                    },
                });
            },
        });

        return () => {
            clearRoomCallbacks();
        };
    }, [navigate]);

    // Keyboard testing listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                p1VelRef.current = JUMP_FORCE;
            }
            if (e.code === "KeyW") {
                p2VelRef.current = JUMP_FORCE;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Animation loop lifecycle
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-1"
            />

            {/* Player 1 info */}
            <div className="fixed top-8 left-8 z-30 flex items-center">
                <div className="flex items-center gap-3 rounded-full bg-[#ED1C24] px-5 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                    <img
                        src={CHARACTER_MAP[p1?.characterId?.toLowerCase() ?? ''] ?? Mochi}
                        alt={p1?.username ?? "P1"}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover bg-white"
                    />
                    <span className="text-sm font-bold text-white whitespace-nowrap">{p1?.username ?? "Player 1"}</span>
                    <span className="text-2xl font-bold text-white ml-2">{p1Score}</span>
                </div>
            </div>

            {/* Timer */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-30">
                <Timer initialSeconds={90} />
            </div>

            {/* Player 2 info */}
            <div className="fixed top-8 right-8 z-30 flex items-center">
                <div className="flex items-center gap-3 rounded-full bg-[#ED1C24] px-5 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                    <span className="text-2xl font-bold text-white mr-2">{p2Score}</span>
                    <span className="text-sm font-bold text-white whitespace-nowrap">{p2?.username ?? "Player 2"}</span>
                    <img
                        src={CHARACTER_MAP[p2?.characterId?.toLowerCase() ?? ''] ?? Mochi}
                        alt={p2?.username ?? "P2"}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover bg-white"
                    />
                </div>
            </div>

            <div className="z-30 relative">
                <Ocean />
            </div>

            {/* Players */}
            {p1 && (
                <div
                    className="fixed z-20 flex flex-col items-center"
                    style={{
                        left: `${P1_X}px`,
                        top: `${p1Y}px`,
                        width: `${BIRD_WIDTH}px`,
                        height: `${BIRD_HEIGHT}px`,
                        opacity: p1Invincible ? 0.6 : 1,
                        transition: 'opacity 0.1s ease',
                    }}
                >
                    <span className="mb-1 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                        {p1.username}
                    </span>
                    <img
                        src={p1Char}
                        alt={p1.username}
                        className="w-full h-full object-contain"
                        style={{
                            transform: `rotate(${Math.min(Math.max(p1VelRef.current * 4, -30), 70)}deg)`,
                            transition: 'transform 0.05s linear',
                            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))'
                        }}
                    />
                </div>
            )}

            {p2 && (
                <div
                    className="fixed z-20 flex flex-col items-center"
                    style={{
                        left: `${P2_X}px`,
                        top: `${p2Y}px`,
                        width: `${BIRD_WIDTH}px`,
                        height: `${BIRD_HEIGHT}px`,
                        opacity: p2Invincible ? 0.6 : 1,
                        transition: 'opacity 0.1s ease',
                    }}
                >
                    <span className="mb-1 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                        {p2.username}
                    </span>
                    <img
                        src={p2Char}
                        alt={p2.username}
                        className="w-full h-full object-contain"
                        style={{
                            transform: `rotate(${Math.min(Math.max(p2VelRef.current * 4, -30), 70)}deg)`,
                            transition: 'transform 0.05s linear',
                            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.3))'
                        }}
                    />
                </div>
            )}

            {columns.map((col) => (
                <React.Fragment key={col.id}>
                    {col.top && (
                        <img
                            src={ASSETS[col.top.typeIndex]}
                            alt="obs-top"
                            className="fixed z-10 pointer-events-none object-contain"
                            style={{
                                width: `${col.top.width}px`,
                                height: `${col.top.height}px`,
                                left: `${col.x}px`,
                                top: `${col.top.topPos}px`,
                                transform: `rotate(${col.top.rotation}deg)`
                            }}
                        />
                    )}
                    {col.bottom && (
                        <img
                            src={ASSETS[col.bottom.typeIndex]}
                            alt="obs-bottom"
                            className="fixed z-10 pointer-events-none object-contain"
                            style={{
                                width: `${col.bottom.width}px`,
                                height: `${col.bottom.height}px`,
                                left: `${col.x}px`,
                                bottom: col.bottom.bottomPos !== undefined ? `${col.bottom.bottomPos}px` : 'auto',
                                top: col.bottom.topPos !== undefined ? `${col.bottom.topPos}px` : 'auto',
                                transform: `rotate(${col.bottom.rotation}deg)`
                            }}
                        />
                    )}
                </React.Fragment>
            ))}

            {/* Le agregue musiquita jajaaj */}
            <iframe
                width="0"
                height="0"
                src="https://www.youtube.com/embed/kEa7el_Tr04?autoplay=1&loop=1&playlist=kEa7el_Tr04&"
                frameBorder="0"
                allow="autoplay"
                className="hidden"
                title="Background Music"
            ></iframe>
        </div>
    );
};

export default FlappyGame;
