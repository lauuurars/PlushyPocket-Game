export type RealtimeClientType = "screen" | "player";

export type RoomStatus = "CREATED" | "WAITING_PLAYERS" | "READY" | "IN_GAME" | "RESULTS";

export type ScreenCreateRoomPayload = {
    minigameId: string;
};

export type RoomCreatedPayload = {
    roomId: string;
    minigameId: string;
    status: RoomStatus;
};

export type PlayerRole = "P1" | "P2";

export type PlayerInfoPayload = {
    userId: string;
    username: string;
    characterId: string;
    role: PlayerRole;
};

export type RoomUpdatePayload = {
    roomId: string;
    minigameId: string;
    status: RoomStatus;
    players: PlayerInfoPayload[];
    playersInRoom: number;
};

export type PlayerJoinPayload = {
    userId: string;
    username: string;
    roomId: string;
    characterId: string;
};

export type GameStartPayload = {
    roomId: string;
    players: PlayerInfoPayload[];
    minigameId: string;
    gameEndTime?: number;
};

export type GameTimerTickPayload = {
    remaining: number;
    gameEndTime: number;
};

export type GameEndPayload = {
    roomId: string;
    winnerId: string;
    loserId: string;
    scores: Record<string, number>;
    isDraw?: boolean;
};

export type GameOverPayload = GameEndPayload;

export type RewardAssignedPayload = {
    userId: string;
    rewardId: string;
    rewardName: string;
    rewardType: "bonus" | "discount" | "character";
    status: "active" | "redeemed" | "expired";
};

export type PlayerActionPayload = {
    userId: string;
    characterId: string;
    action: string;
    timestamp: number;
    roomId?: string;
    payload?: Record<string, unknown>;
};
