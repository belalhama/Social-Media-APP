import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { username, email, password } = req.body;
            const { user, token } = await authService.signup({ username, email, password });
            res.status(201).json({ status: "success", message: "Account created", data: { user, token } });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const { user, token } = await authService.login({ email, password });
            res.status(200).json({ status: "success", message: "Logged in", data: { user, token } });
        } catch (error) {
            next(error);
        }
    }
}
