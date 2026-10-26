import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../config/config.service.js";

export const hashPassword = async (plainText: string): Promise<string> => {
    return await bcrypt.hash(plainText, SALT_ROUNDS);
};

export const comparePassword = async (plainText: string, hashed: string): Promise<boolean> => {
    return await bcrypt.compare(plainText, hashed);
};
