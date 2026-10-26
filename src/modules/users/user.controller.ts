import type { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";

const userService = new UserService();

export class UserController {
    static async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.getUserById(req.user!.id);
            res.status(200).json({ status: "success", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.updateProfile(req.user!.id, req.body);
            res.status(200).json({ status: "success", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { oldPassword, newPassword } = req.body;
            const token = await userService.changePassword(req.user!.id, oldPassword, newPassword);
            res.status(200).json({ status: "success", message: "Password changed", data: { token } });
        } catch (error) {
            next(error);
        }
    }

    static async deleteMyAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await userService.deleteAccount(req.user!.id);
            res.status(200).json({ status: "success", message: "Account deleted" });
        } catch (error) {
            next(error);
        }
    }

    static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.getUserById(req.params.id as string);
            res.status(200).json({ status: "success", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getUserPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const posts = await userService.getUserPosts(req.params.id as string);
            res.status(200).json({ status: "success", results: posts.length, data: posts });
        } catch (error) {
            next(error);
        }
    }

    static async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.follow(req.user!.id, req.params.id as string);
            res.status(200).json({ status: "success", message: "User followed", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await userService.unfollow(req.user!.id, req.params.id as string);
            res.status(200).json({ status: "success", message: "User unfollowed", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const followers = await userService.getFollowers(req.params.id as string);
            res.status(200).json({ status: "success", results: followers.length, data: followers });
        } catch (error) {
            next(error);
        }
    }

    static async getFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const following = await userService.getFollowing(req.params.id as string);
            res.status(200).json({ status: "success", results: following.length, data: following });
        } catch (error) {
            next(error);
        }
    }
}
