import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

const authRouter = Router();

// POST /api/auth/signup
authRouter.post("/signup", AuthValidation.validateSignup, AuthController.signup);

// POST /api/auth/login
authRouter.post("/login", AuthValidation.validateLogin, AuthController.login);

export default authRouter;
