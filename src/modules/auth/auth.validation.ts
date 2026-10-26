import type { Request, Response, NextFunction } from "express";
import { appError } from "../../common/middleware/globalErrorHandler.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;

/**
 * Validation middleware for auth-related operations.
 */
export class AuthValidation {
    static validateSignup(req: Request, res: Response, next: NextFunction): void {
        const { username, email, password, confirmPassword } = req.body ?? {};

        if (!username || typeof username !== "string" || !USERNAME_REGEX.test(username)) {
            throw new appError("Username is required (3-30 chars: letters, numbers, _ or .)", 400);
        }

        if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
            throw new appError("A valid email is required", 400);
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            throw new appError("Password is required and must be at least 6 characters", 400);
        }

        if (password !== confirmPassword) {
            throw new appError("Password and confirmPassword do not match", 400);
        }

        next();
    }

    static validateLogin(req: Request, res: Response, next: NextFunction): void {
        const { email, password } = req.body ?? {};

        if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
            throw new appError("A valid email is required", 400);
        }

        if (!password || typeof password !== "string") {
            throw new appError("Password is required", 400);
        }

        next();
    }
}
