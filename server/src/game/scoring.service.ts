import { PlayerGameData } from "../types/game.types"

type ScoringFn = (data: PlayerGameData) => number

const STRATEGIES: Record<string, ScoringFn> = {
    "cake": (data) => {
        const maxRms = (data.payload?.maxRms as number) ?? 0
        return Math.round(Math.min(maxRms / 0.12, 1) * 250)
    },
    "flappy-boat": (data) => {
        return (data.payload?.score as number) ?? data.score ?? 0
    },
    "hammer-mole": (data) => {
        return data.score ?? 0
    },
}

export function calculateScore(minigameId: string, data: PlayerGameData): number {
    const fn = STRATEGIES[minigameId]
    if (!fn) return data.score ?? 0
    return fn(data)
}

export function determineWinner(scores: Record<string, number>): { winnerId: string | null; loserId: string | null } {
    const entries = Object.entries(scores)
    if (entries.length < 2) return { winnerId: null, loserId: null }

    const sorted = entries.sort((a, b) => b[1] - a[1])
    return { winnerId: sorted[0][0], loserId: sorted[1][0] }
}
