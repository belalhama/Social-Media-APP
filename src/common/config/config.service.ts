import { config } from "dotenv";
import { resolve } from "path";

export const NODE_ENV = process.env.NODE_ENV || "development";

config({
    path: resolve(`.env.${NODE_ENV}`),
});

export const PORT = Number(process.env.PORT) || 3001;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/social_app";

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

if (!JWT_SECRET) {
    throw new Error(`JWT_SECRET is missing. Add it to .env.${NODE_ENV} (see .env.example)`);
}
