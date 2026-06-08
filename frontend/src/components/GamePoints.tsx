import React, { useEffect, useState } from 'react';
import MochiAvatar from '../assets/choose/Mochi.svg';
import MisuAvatar from '../assets/choose/Misu.svg';
import YukiAvatar from '../assets/choose/Yuki.svg';
import { getRoomState } from '../lib/roomStore';

interface GamePointsProps {
    points: number;
    playerRole?: "P1" | "P2";
}

const getAvatar = (characterId?: string) => {
    const key = (characterId ?? "").toLowerCase();
    if (key.includes("misu")) return MisuAvatar;
    if (key.includes("yuki")) return YukiAvatar;
    return MochiAvatar;
};

export const GamePoints: React.FC<GamePointsProps> = ({ points, playerRole = "P1" }) => {
    const [playerName, setPlayerName] = useState<string>("Player");
    const [characterId, setCharacterId] = useState<string>("mochi");

    useEffect(() => {
        const state = getRoomState();
        const player = state.players.find(p => p.role === playerRole);
        if (player) {
            setPlayerName(player.username);
            setCharacterId(player.characterId);
        }
    }, [playerRole]);

    return (
        <div className="flex items-center bg-[#FF7BE4] rounded-full h-[60px] pr-8 shadow-[0_4px_10px_rgba(0,0,0,0.2)] relative" style={{ minWidth: '210px' }}>
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full bg-[#8A56DF] flex items-center justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                <img src={getAvatar(characterId)} alt="avatar" className="w-[85%] h-auto object-contain translate-y-2" />
            </div>
            <div className="flex flex-col items-start justify-center text-white ml-[82px] h-full pt-1 pb-1">
                <span className="text-[18px] font-bold leading-none mb-0.5" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
                    {playerName}
                </span>
                <span className="text-[34px] font-extrabold leading-none tracking-tight" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
                    {points} pts
                </span>
            </div>
        </div>
    );
};

export default GamePoints;
