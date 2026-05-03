import express, { Request, Response } from "express"

export const AuthRouter = express.Router()

AuthRouter.get("/", (req: Request, res: Response) => {
    res.json({ message: "auth module – coming soon" })
})