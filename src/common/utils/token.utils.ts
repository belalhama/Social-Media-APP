import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.service.js";

export interface TokenPayload extends JwtPayload {
    id: string;
    /** Issued-at in milliseconds (JWT `iat` is only second-precision). */
    iatMs?: number;
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId, iatMs: Date.now() }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
    });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
