import type { Request, Response, NextFunction } from "express";
import { appError } from "./globalErrorHandler.js";
import { verifyToken } from "../utils/token.utils.js";
import { UserRepository } from "../../DB/repositories/user.repository.js";

const userRepository = new UserRepository();

/**
 * Protects a route: requires `Authorization: Bearer <token>`.
 * On success the logged-in user is attached to `req.user`.
 */
export const authentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new appError("Authentication required. Send header: Authorization: Bearer <token>", 401);
        }

        const token = authorization.split(" ")[1];
        if (!token) {
            throw new appError("Token is missing", 401);
        }

        const payload = verifyToken(token);

        const user = await userRepository.findByIdWithAuthInfo(payload.id);
        if (!user) {
            throw new appError("User of this token no longer exists", 401);
        }

        // Reject tokens issued before the last password change
        if (user.passwordChangedAt) {
            const issuedAtMs = payload.iatMs ?? (payload.iat ?? 0) * 1000;
            if (issuedAtMs < user.passwordChangedAt.getTime()) {
                throw new appError("Password was changed, please login again", 401);
            }
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
