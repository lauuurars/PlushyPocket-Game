import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GamePoints from '../../../components/GamePoints';
import Catapulta from '../../../assets/cake/Catapulta.svg';
import CatapultaTwo from '../../../assets/cake/Catapulta2.svg';
import { getRoomState, setRoomCallbacks, clearRoomCallbacks } from '../../../lib/roomStore';
import type { GameOverPayload, RewardAssignedPayload } from '../../../lib/api';

const CakeGame: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);

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

        setRoomCallbacks({
            onScoreUpdate: (userId, score) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                if (p1 && userId === p1.userId) setP1Score(score);
                if (p2 && userId === p2.userId) setP2Score(score);
            },
            onTimerTick: () => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                if (p1) setP1Score(room.scores[p1.userId] ?? 0);
                if (p2) setP2Score(room.scores[p2.userId] ?? 0);
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
                        winnerPlayer: (p1 && payload.winnerId === p1.userId ? 1 : 2) as 1 | 2,
                        winnerName: (p1 && payload.winnerId === p1.userId ? p1 : p2)?.username ?? "Player",
                        player1Name: p1?.username ?? "Player 1",
                        player2Name: p2?.username ?? "Player 2",
                        player1Score: p1Score,
                        player2Score: p2Score,
                    },
                });
            },
            onRewardAssigned: (payload: RewardAssignedPayload) => {
                const room = getRoomState();
                const p1 = room.players.find(p => p.role === "P1");
                const p2 = room.players.find(p => p.role === "P2");
                const winnerPlayer = (p1 && payload.userId === p1.userId ? 1 : 2) as 1 | 2;
                const winnerName = (p1 && payload.userId === p1.userId ? p1 : p2)?.username ?? "Player";

                navigate('/results', {
                    replace: true,
                    state: {
                        roomCode: room.roomId,
                        winnerPlayer,
                        winnerName,
                        player1Name: p1?.username ?? "Player 1",
                        player2Name: p2?.username ?? "Player 2",
                        player1Score: room.scores[p1?.userId ?? ""] ?? 0,
                        player2Score: room.scores[p2?.userId ?? ""] ?? 0,
                        rewardName: payload.rewardName,
                    },
                });
            },
        });

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            document.body.style.overflow = 'auto';
            clearRoomCallbacks();
        };
    }, [navigate]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="fixed top-0 left-0 w-screen h-dvh object-cover -scale-x-100 z-0"
            />

            <div className="fixed top-8 left-70 -translate-x-1/2 z-30">
                <GamePoints points={p1Score} />
            </div>
            <div className="fixed top-8 right-40 -translate-x-1/2 z-30">
                <GamePoints points={p2Score} />
            </div>

            <img
                src={Catapulta}
                alt="Catapulta"
                className="fixed bottom-0 right-10 z-20 w-110 pointer-events-none"
            />

            <img
                src={CatapultaTwo}
                alt="Catapulta"
                className="fixed bottom-0 left-10 z-20 w-110 pointer-events-none"
            />
        </div>
    );
};

export default CakeGame;
