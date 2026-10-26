import type { Request, Response, NextFunction } from "express";
import { PostService } from "./post.service.js";

const postService = new PostService();

/** Reads ?page=&limit= safely (limit capped at 50). */
const getPagination = (req: Request): { page: number; limit: number } => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    return { page, limit };
};

export class PostController {
    static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.createPost(req.user!.id, req.body);
            res.status(201).json({ status: "success", data: post });
        } catch (error) {
            next(error);
        }
    }

    static async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit } = getPagination(req);
            const posts = await postService.getAllPosts(page, limit);
            res.status(200).json({ status: "success", page, results: posts.length, data: posts });
        } catch (error) {
            next(error);
        }
    }

    static async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit } = getPagination(req);
            const posts = await postService.getFeed(req.user!, page, limit);
            res.status(200).json({ status: "success", page, results: posts.length, data: posts });
        } catch (error) {
            next(error);
        }
    }

    static async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.getPostById(req.params.id as string);
            res.status(200).json({ status: "success", data: post });
        } catch (error) {
            next(error);
        }
    }

    static async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.updatePost(req.params.id as string, req.user!.id, req.body);
            res.status(200).json({ status: "success", data: post });
        } catch (error) {
            next(error);
        }
    }

    static async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await postService.deletePost(req.params.id as string, req.user!.id);
            res.status(200).json({ status: "success", message: "Post deleted" });
        } catch (error) {
            next(error);
        }
    }

    static async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { post, liked } = await postService.toggleLike(req.params.id as string, req.user!.id);
            res.status(200).json({
                status: "success",
                message: liked ? "Post liked" : "Post unliked",
                data: post,
            });
        } catch (error) {
            next(error);
        }
    }

    static async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.addComment(req.params.id as string, req.user!.id, req.body.text);
            res.status(201).json({ status: "success", data: post });
        } catch (error) {
            next(error);
        }
    }

    static async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const post = await postService.deleteComment(
                req.params.id as string,
                req.params.commentId as string,
                req.user!.id
            );
            res.status(200).json({ status: "success", message: "Comment deleted", data: post });
        } catch (error) {
            next(error);
        }
    }
}
