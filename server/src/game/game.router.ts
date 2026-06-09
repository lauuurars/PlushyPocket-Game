import express from "express"
import GameController from "./game.controller"

export const GameRouter = express.Router()

GameRouter.post("/start", GameController.startGame)
GameRouter.post("/finish", GameController.finishGame)