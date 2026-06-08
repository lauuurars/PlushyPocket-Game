import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    initialSeconds: number;
    /** Server-synced seconds left. When set, local countdown is disabled. */
    remaining?: number | null;
    onTimeUp?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, remaining, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isUrgent, setIsUrgent] = useState(false);
    const isSynced = remaining != null;
    const displayTime = isSynced ? remaining : timeLeft;

    // Local countdown for games without server sync (e.g. Cake, Flappy)
    useEffect(() => {
        if (isSynced) return;

        setTimeLeft(initialSeconds);

        if (initialSeconds <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSynced, initialSeconds, onTimeUp]);

    useEffect(() => {
        if (isSynced && remaining <= 0) onTimeUp?.();
    }, [isSynced, remaining, onTimeUp]);

    useEffect(() => {
        setIsUrgent(displayTime <= 10 && displayTime > 0);
    }, [displayTime]);

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="relative z-30">
            <style>{`
                @keyframes urgent-pulse {
                    0%, 100% { background-color: #ED1C24; }
                    50% { background-color: #a6070cff; }
                }
                @keyframes urgent-pulse-border {
                    0%, 100% { border-color: #ED1C24; }
                    50% { border-color: #a6070cff; }
                }
                @keyframes urgent-pulse-clock {
                    0%, 100% { color: #ED1C24; }
                    50% { color: #a6070cff; }
                }
                .urgent {
                    animation: urgent-pulse 0.5s ease-in-out infinite;
                }
                .urgent-border {
                    animation: urgent-pulse-border 0.5s ease-in-out infinite;
                }
                .urgent-clock {
                    animation: urgent-pulse-clock 0.5s ease-in-out infinite;
                }
            `}</style>
            
            {/* Clock icon circle */}
            <div className={`absolute left-0 top-0 z-10 flex h-[67px] w-[67px] items-center justify-center rounded-full border-5 bg-[#FAFAFA] ${isUrgent ? 'urgent-border' : 'border-[#ED1C24]'}`}>
                <Clock size={40} color={isUrgent ? '#a6070cff' : '#ED1C24'} strokeWidth={2.5} className={isUrgent ? 'urgent-clock' : ''} />
            </div>

            {/* Timer background rectangle */}
            <div 
                className={`ml-8 flex items-center justify-end rounded-r-[36px] rounded-l-none pl-10 pr-12 py-5 shadow-[0_3px_9px_rgba(76,76,76,0.25)] ${isUrgent ? 'urgent' : 'bg-[#ED1C24]'}`}
                style={{ width: '213px' }}
            >
                <p 
                    className="text-[48px] font-bold leading-[27px] text-[#FAFAFA]"
                    style={{ fontFamily: "'Baloo 2', system-ui, sans-serif" }}
                >
                    {formatTime(displayTime)}
                </p>
            </div>
        </div>
    );
};

export default Timer;
