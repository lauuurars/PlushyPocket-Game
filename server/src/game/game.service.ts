import GameRepository from "./game.repository"
import { StartGameDTO, StartGameResponse, FinishGameDTO, FinishGameResponse } from "../types/game.types"

const startGame = async (dto: StartGameDTO): Promise<StartGameResponse> => {
    const player1 = await GameRepository.findUserById(dto.player1_id)
    if (!player1) throw new Error(`Player 1 not found: ${dto.player1_id}`)

    const player2 = await GameRepository.findUserById(dto.player2_id)
    if (!player2) throw new Error(`Player 2 not found: ${dto.player2_id}`)

    return { player1, player2 }
}

const finishGame = async (dto: FinishGameDTO): Promise<FinishGameResponse> => {
    const winner = await GameRepository.findUserById(dto.winner_id)
    if (!winner) throw new Error(`Winner not found: ${dto.winner_id}`)

    const reward = await GameRepository.findRewardById(dto.reward_id)
    if (!reward) throw new Error(`Reward not found: ${dto.reward_id}`)

    if (reward.reward_type === "character") { // los personajes se ganan solo por QR
        throw new Error("Characters are unlocked via QR, not as game rewards")
    }

    const user_reward = await GameRepository.grantRewardToWinner(dto)

    return { winner, reward, user_reward }
}

export default {
    startGame,
    finishGame,
}