export interface Player {
    id: string
    username: string
    email: string
    age: number | null
}

export interface StartGameResponse {
    player1: Player
    player2: Player
}

export interface StartGameDTO {
    player1_id: string
    player2_id: string
}

export interface FinishGameDTO {
    winner_id: string
    reward_id: string
}

export type RewardType = "bonus" | "discount" | "character"
export type RewardStatus = "active" | "redeemed" | "expired"

export interface Reward {
    id: string
    reward_name: string
    reward_type: RewardType
}

export interface UserReward {
    id: string
    user_id: string
    reward_id: string
    status: RewardStatus
}

export interface FinishGameResponse {
    winner: Player
    reward: Reward
    user_reward: UserReward
}