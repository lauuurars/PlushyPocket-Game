import { useEffect, useState } from "react";

export function calcGameRemaining(gameEndTime: number | null | undefined): number {
    if (!gameEndTime) return 0;
    return Math.max(0, Math.ceil((gameEndTime - Date.now()) / 1000));
}

/** Local countdown driven by server gameEndTime; recalculates on visibility restore. */
export function useGameTimer(gameEndTime: number | null): number {
    const [remaining, setRemaining] = useState(() => calcGameRemaining(gameEndTime));

    useEffect(() => {
        setRemaining(calcGameRemaining(gameEndTime));
    }, [gameEndTime]);

    useEffect(() => {
        if (!gameEndTime) return;

        const tick = () => setRemaining(calcGameRemaining(gameEndTime));

        const interval = setInterval(tick, 250);
        const onVisibility = () => {
            if (document.visibilityState === "visible") tick();
        };

        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [gameEndTime]);

    return remaining;
}
