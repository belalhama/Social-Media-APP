import type { Request, Response, NextFunction } from "express";
import { appError } from "../../common/middleware/globalErrorHandler.js";

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;
const ALLOWED_PROFILE_FIELDS = ["username", "bio", "profilePicture"];

/**
 * Validation middleware for user-related operations.
 */
export class UserValidation {
    static validateUpdateProfile(req: Request, res: Response, next: NextFunction): void {
        const body = req.body ?? {};
        const keys = Object.keys(body);

        if (keys.length === 0) {
            throw new appError(`Send at least one field to update: ${ALLOWED_PROFILE_FIELDS.join(", ")}`, 400);
        }

        const notAllowed = keys.filter((k) => !ALLOWED_PROFILE_FIELDS.includes(k));
        if (notAllowed.length) {
            throw new appError(`Fields not allowed: ${notAllowed.join(", ")}`, 400);
        }

        const { username, bio, profilePicture } = body;

        if (username !== undefined && (typeof username !== "string" || !USERNAME_REGEX.test(username))) {
            throw new appError("Username must be 3-30 chars: letters, numbers, _ or .", 400);
        }

        if (bio !== undefined && (typeof bio !== "string" || bio.length > 160)) {
            throw new appError("Bio must be a string of at most 160 characters", 400);
        }

        if (profilePicture !== undefined && typeof profilePicture !== "string") {
            throw new appError("profilePicture must be a URL string", 400);
        }

        next();
    }

    static validateChangePassword(req: Request, res: Response, next: NextFunction): void {
        const { oldPassword, newPassword, confirmPassword } = req.body ?? {};

        if (!oldPassword || typeof oldPassword !== "string") {
            throw new appError("oldPassword is required", 400);
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
            throw new appError("newPassword is required and must be at least 6 characters", 400);
        }

        if (newPassword === oldPassword) {
            throw new appError("newPassword must be different from oldPassword", 400);
        }

        if (newPassword !== confirmPassword) {
            throw new appError("newPassword and confirmPassword do not match", 400);
        }

        next();
    }
}
