import type { Request, Response, NextFunction } from "express";
import { appError } from "../../common/middleware/globalErrorHandler.js";

/**
 * Validation middleware for post-related operations.
 * The author / user is taken from the JWT (req.user), never from the body.
 */
export class PostValidation {
    static validateCreatePost(req: Request, res: Response, next: NextFunction): void {
        const { content, image } = req.body ?? {};

        if (!content || typeof content !== "string" || !content.trim()) {
            throw new appError("Content is required and must be a string", 400);
        }

        if (content.length > 500) {
            throw new appError("Content must not exceed 500 characters", 400);
        }

        if (image !== undefined && typeof image !== "string") {
            throw new appError("Image must be a URL string", 400);
        }

        next();
    }

    static validateUpdatePost(req: Request, res: Response, next: NextFunction): void {
        const { content, image } = req.body ?? {};

        if (content === undefined && image === undefined) {
            throw new appError("Send content and/or image to update", 400);
        }

        if (content !== undefined) {
            if (typeof content !== "string" || !content.trim()) {
                throw new appError("Content must be a non-empty string", 400);
            }
            if (content.length > 500) {
                throw new appError("Content must not exceed 500 characters", 400);
            }
        }

        if (image !== undefined && typeof image !== "string") {
            throw new appError("Image must be a URL string", 400);
        }

        next();
    }

    static validateAddComment(req: Request, res: Response, next: NextFunction): void {
        const { text } = req.body ?? {};

        if (!text || typeof text !== "string" || !text.trim()) {
            throw new appError("Comment text is required and must be a string", 400);
        }

        if (text.length > 300) {
            throw new appError("Comment must not exceed 300 characters", 400);
        }

        next();
    }
}
