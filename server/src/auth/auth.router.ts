import express from "express"

import AuthController from "./auth.controller"

export const AuthRouter = express.Router()

AuthRouter.post("/register", AuthController.register)
AuthRouter.post("/login", AuthController.login)
AuthRouter.get("/me", AuthController.me)
AuthRouter.patch("/age", AuthController.updateAge)
