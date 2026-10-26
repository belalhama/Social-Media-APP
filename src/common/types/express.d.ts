import type { IUser } from "../../DB/models/user.model.js";

declare global {
    namespace Express {
        interface Request {
            /** Set by the `authentication` middleware for logged-in users. */
            user?: IUser;
        }
    }
}

export {};
