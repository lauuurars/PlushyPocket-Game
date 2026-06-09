import mochiPlayerOneUrl from "../assets/choose/Mochi.svg?url";
import mockAvatarUrl from "../assets/choose/Misu.svg?url";

/** Avatar fijo de Player 1 (desktop party / results). */
export const PLAYER_1_FIXED_AVATAR_URL = mochiPlayerOneUrl as string;

/** Duración vista Party Room antes de ir a Results (salas mockeadas). */
export const PARTY_TRANSITION_MS = 5000;

/** Segundo jugador fijo mientras la sala está mockeada. */
export const MOCK_PARTY_PLAYER2 = {
    name: "Guest plushy",
    avatarUrl: mockAvatarUrl as string,
} as const;
