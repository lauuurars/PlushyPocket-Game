import React from 'react';

interface GamePointsProps {
    points: number;
}

export const GamePoints: React.FC<GamePointsProps> = ({ points }) => {
    return (
        <div className="
            flex items-center justify-center
            bg-[#ED1C24] 
            text-[#FAFAFA] 
            px-12 py-3 
            rounded-full 
            font-bold 
            text-4xl
            shadow-[0_4px_10px_rgba(0,0,0,0.3)]
            tracking-tight
        ">
            Points: {points}
        </div>
    );
};

export default GamePoints;
