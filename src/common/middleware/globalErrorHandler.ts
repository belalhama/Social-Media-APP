import type { Request, Response, NextFunction } from "express";
import { NODE_ENV } from "../config/config.service.js";

export class appError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.cause = statusCode;
    }
}

/**
 * Catch-all for routes that do not exist.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    next(new appError(`Invalid URL : ${req.method} ${req.originalUrl} not found`, 404));
};

/**
 * Global error handler. Converts known Mongoose / JWT errors into clean HTTP responses.
 */
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    let statusCode: number = error.statusCode || (typeof error.cause === "number" ? error.cause : 500);
    let message: string = error.message || "Internal server error";

    // Invalid MongoDB ObjectId (e.g. /api/posts/123)
    if (error.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${error.path}: ${error.value}`;
    }

    // Mongoose schema validation errors
    if (error.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(error.errors as Record<string, { message: string }>)
            .map((e) => e.message)
            .join(", ");
    }

    // Duplicate unique field (email / username)
    if (error.code === 11000) {
        statusCode = 409;
        message = `${Object.keys(error.keyValue || {}).join(", ")} already exists`;
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired, please login again";
    }

    // Malformed JSON body
    if (error.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Invalid JSON body";
    }

    res.status(statusCode).json({
        status: statusCode < 500 ? "fail" : "error",
        message,
        statusCode,
        ...(NODE_ENV === "development" && { stack: error.stack }),
    });
};