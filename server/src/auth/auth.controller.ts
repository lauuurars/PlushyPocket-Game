import { Request, Response } from "express"

import AuthService from "./auth.service"
import type { LoginDTO, RegisterDTO, UpdateAgeDTO, UpdateCharacterDTO } from "../types/auth.types"

const register = async (req: Request, res: Response) => {
    try {
        const dto = req.body as RegisterDTO
        const result = await AuthService.register(dto)
        const status = result.session ? 201 : 200
        res.status(status).json(result)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Registration failed"
        res.status(400).json({ error: message })
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const dto = req.body as LoginDTO
        const result = await AuthService.login(dto)
        res.status(200).json(result)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Login failed"
        const lowered = message.toLowerCase()
        const status =
            lowered.includes("invalid login") ||
            lowered.includes("invalid credentials") ||
            lowered.includes("email not confirmed")
                ? 401
                : 400
        res.status(status).json({ error: message })
    }
}

const me = async (req: Request, res: Response) => {
    try {
        const header = req.headers.authorization
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null

        if (!token) {
            res.status(401).json({ error: "Missing Bearer token" })
            return
        }

        const user = await AuthService.getMeFromBearerToken(token)
        res.json(user)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid session"
        res.status(401).json({ error: message })
    }
}

const updateAge = async (req: Request, res: Response) => {
    try {
        const header = req.headers.authorization
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null

        if (!token) {
            res.status(401).json({ error: "Missing Bearer token" })
            return
        }

        const { age } = req.body as UpdateAgeDTO
        await AuthService.updateAgeForBearerToken(token, age)
        res.status(204).send()
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Could not save age"
        const lowered = message.toLowerCase()
        const status =
            lowered.includes("invalid session") ||
            lowered.includes("jwt") ||
            lowered.includes("bearer")
                ? 401
                : 400
        res.status(status).json({ error: message })
    }
}

const updateCharacter = async (req: Request, res: Response) => {
    try {
        const header = req.headers.authorization
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null

        if (!token) {
            res.status(401).json({ error: "Missing Bearer token" })
            return
        }

        const body = req.body as UpdateCharacterDTO
        await AuthService.updateCharacterForBearerToken(token, body)
        res.status(204).send()
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Could not save character"
        const lowered = message.toLowerCase()
        const status =
            lowered.includes("invalid session") ||
            lowered.includes("jwt") ||
            lowered.includes("bearer")
                ? 401
                : 400
        res.status(status).json({ error: message })
    }
}

export default {
    register,
    login,
    me,
    updateAge,
    updateCharacter,
}
