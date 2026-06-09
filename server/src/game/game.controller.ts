import { Request, Response } from "express"
import GameService from "./game.service"
import { StartGameDTO, FinishGameDTO } from "../types/game.types"

const startGame = async (req: Request, res: Response) => {
    try {
        const dto = req.body as StartGameDTO
        if (!dto.player1_id || !dto.player2_id) {
            res.status(400).json({ message: "player1_id and player2_id are required" })
            return
        }
        if (dto.player1_id === dto.player2_id) {
            res.status(400).json({ message: "Players must be different users" })
            return
        }
        const result = await GameService.startGame(dto)
        res.status(200).json(result)
    } catch (error: any) {
        // We use 404/400 for business logic errors thrown from service
        res.status(400).json({ error: error.message })
    }
}

const finishGame = async (req: Request, res: Response) => {
    try {
        const dto = req.body as FinishGameDTO
        if (!dto.winner_id || !dto.reward_id) {
            res.status(400).json({ message: "winner_id and reward_id are required" })
            return
        }
        const result = await GameService.finishGame(dto)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
}

export default {
    startGame,
    finishGame,
}