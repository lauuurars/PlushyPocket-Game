export type ClientType = "screen" | "player" 

export type PlayerRole = "P1" | "P2"

export type RoomStatus = "CREATED" | "WAITING_PLAYERS" | "READY" | "IN_GAME" | "RESULTS"

export type RewardType = "bonus" | "discount" | "character"
export type RewardStatus = "active" | "redeemed" | "expired"

export interface ScreenCreateRoomPayload {
    minigameId: string
}

export interface RoomCreatedPayload {
    roomId: string
    minigameId: string
    status: RoomStatus
}

export interface PlayerInfoPayload {
    userId: string
    username: string
    characterId: string
    role: PlayerRole
}

export interface RoomUpdatePayload {
    roomId: string
    minigameId: string
    status: RoomStatus
    players: PlayerInfoPayload[]
    playersInRoom: number
}

export interface PlayerJoinPayload {
    userId: string;
    username: string;
    roomId: string; // se maneja en memoria :p
    characterId: string;
}

export interface PlayerActionPayload {
    userId: string;
    characterId: string;
    action: string;
    timestamp: number;
    roomId?: string
    payload?: Record<string, unknown>
}

export interface GameStartPayload {
    roomId: string;
    players: PlayerInfoPayload[];
    minigameId: string
    gameEndTime?: number
}

export interface GameTimerTickPayload {
    remaining: number
    gameEndTime: number
}

export interface GameEndPayload {
    roomId: string;
    winnerId: string;   // users.id del ganador
    loserId: string;    // users.id del perdedor
    scores: Record<string, number>  // userId -> puntaje final
}

export type GameOverPayload = GameEndPayload

export interface RewardAssignedPayload {
    userId: string;       
    rewardId: string;    
    rewardName: string;   
    rewardType: RewardType;  
    status: RewardStatus; 
}

export type RoomPlayer = {
    userId: string
    username: string
    characterId: string
    role: PlayerRole
    socketId: string
}

export type Room = {
    roomId: string
    minigameId: string
    status: RoomStatus
    screenSocketId: string | null
    players: RoomPlayer[]
    scores: Record<string, number>       // userId -> score acumulado durante la partida
    playerData: Record<string, Record<string, unknown>>  // userId -> datos crudos del juego
    gameEndTime?: number                  // timestamp de cuando termina el juego
}

export const GAME_DURATION: Record<string, number> = {
    "cake": 60,
    "flappy-boat": 60,
    "hammer-mole": 60,
}

export type SocketSession = {
    clientType: ClientType
    roomId?: string
    userId?: string
}
