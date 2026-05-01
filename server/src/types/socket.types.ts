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
}

export interface GameStartPayload {
    roomId: string;
    players: string[]; // array de users.id  
}


export interface GameEndPayload {
    roomId: string;
    winnerId: string;   // users.id del ganador
    loserId: string;    // users.id del perdedor
}

export type RewardType = "bonus" | "discount" | "character"
export type RewardStatus = "active" | "redeemed" | "expired";

// info q el servidor envía al ganador

export interface RewardAssignedPayload {
    userId: string;       
    rewardId: string;    
    rewardName: string;   
    rewardType: RewardType;  
    status: RewardStatus; 
}