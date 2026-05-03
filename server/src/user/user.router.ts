import express, { Request, Response } from "express"

export const UserRouter = express.Router()

UserRouter.get("/", (req: Request, res: Response) => {
    res.json({ message: "user module – coming soon" })
})