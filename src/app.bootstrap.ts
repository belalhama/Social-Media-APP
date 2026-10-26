import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import { PORT, MONGO_URI } from "./common/config/config.service.js";
import { globalErrorHandler, notFoundHandler } from "./common/middleware/globalErrorHandler.js";
import connectionDB from "./DB/connectionDB.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.routes.js";
import postRouter from "./modules/post/post.routes.js";

const app = express();
const port = PORT;


export const bootstrap = async () => {
    // Connect to MongoDB
    await connectionDB(MONGO_URI);

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        handler: (req, res, next) => {
            res.status(429).json({ message: "too many requests" })
        }
    });

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(limiter);

    // Root route
    app.get("/", (req, res, next) => {
        res.status(200).json(({
            message: "Hello world "
        }))
    })

    // API routes
    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/posts", postRouter);

    // Catch-all for invalid routes
    app.use(notFoundHandler);

    // Global error handler
    app.use(globalErrorHandler);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })

}