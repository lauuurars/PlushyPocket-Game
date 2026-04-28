import { SupabaseClient } from "../config/supabase"
import { Player, Reward, UserReward, FinishGameDTO } from "../types/game.types"

const findUserById = async (id: string): Promise<Player | null> => {
    const { data, error } = await SupabaseClient
        .from("users")
        .select("id, username, email, age")
        .eq("id", id)
        .single()

    if (error) return null
    return data as Player
}

const findRewardById = async (id: string): Promise<Reward | null> => {
    const { data, error } = await SupabaseClient
        .from("rewards")
        .select("id, reward_name, reward_type")
        .eq("id", id)
        .single()

    if (error) return null
    return data as Reward
}

import crypto from "crypto"

const grantRewardToWinner = async (dto: FinishGameDTO): Promise<UserReward> => {
    const newId = crypto.randomUUID()
    const { data, error } = await SupabaseClient
        .from("users_rewards")
        .insert({
            id: newId,
            user_id: dto.winner_id,
            reward_id: dto.reward_id,
            status: "active",
        })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data as UserReward
}

export default {
    findUserById,
    findRewardById,
    grantRewardToWinner,
}