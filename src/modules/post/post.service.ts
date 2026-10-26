import { PostRepository } from "../../DB/repositories/post.repository.js";
import type { IPost } from "../../DB/models/post.model.js";
import type { IUser } from "../../DB/models/user.model.js";
import { appError } from "../../common/middleware/globalErrorHandler.js";

const postRepository = new PostRepository();

interface PostData {
    content?: string;
    image?: string;
}

export class PostService {
    async createPost(authorId: string, data: PostData): Promise<IPost> {
        if (!data.content) {
            throw new appError("Content is required", 400);
        }
        return await postRepository.create({
            author: authorId as unknown as IPost["author"],
            content: data.content,
            ...(data.image !== undefined && { image: data.image }),
        });
    }

    async getAllPosts(page?: number, limit?: number): Promise<IPost[]> {
        return await postRepository.findAllPaginated(page, limit);
    }

    async getPostById(id: string): Promise<IPost> {
        const post = await postRepository.findByIdPopulated(id);
        if (!post) {
            throw new appError("Post not found", 404);
        }
        return post;
    }

    /** Loads a post and makes sure `userId` is its author. */
    private async getOwnPost(postId: string, userId: string): Promise<IPost> {
        const post = await postRepository.findById(postId);
        if (!post) {
            throw new appError("Post not found", 404);
        }
        if (post.author.toString() !== userId) {
            throw new appError("You are not allowed to modify this post", 403);
        }
        return post;
    }

    async updatePost(postId: string, userId: string, data: PostData): Promise<IPost> {
        await this.getOwnPost(postId, userId);

        const update: PostData = {};
        if (data.content !== undefined) update.content = data.content;
        if (data.image !== undefined) update.image = data.image;

        return (await postRepository.updateById(postId, update)) as IPost;
    }

    async deletePost(postId: string, userId: string): Promise<void> {
        await this.getOwnPost(postId, userId);
        await postRepository.deleteById(postId);
    }

    async toggleLike(postId: string, userId: string): Promise<{ post: IPost; liked: boolean }> {
        const post = await postRepository.toggleLike(postId, userId);
        if (!post) {
            throw new appError("Post not found", 404);
        }
        const liked = post.likes.some((id) => id.toString() === userId);
        return { post, liked };
    }

    async addComment(postId: string, userId: string, text: string): Promise<IPost> {
        if (!text) {
            throw new appError("Comment text is required", 400);
        }
        const post = await postRepository.addComment(postId, userId, text);
        if (!post) {
            throw new appError("Post not found", 404);
        }
        return post;
    }

    /** Comment author OR post author can delete a comment. */
    async deleteComment(postId: string, commentId: string, userId: string): Promise<IPost> {
        const post = await postRepository.findById(postId);
        if (!post) {
            throw new appError("Post not found", 404);
        }

        const comment = post.comments.find((c: any) => c._id.toString() === commentId);
        if (!comment) {
            throw new appError("Comment not found", 404);
        }

        const isCommentOwner = comment.user.toString() === userId;
        const isPostOwner = post.author.toString() === userId;
        if (!isCommentOwner && !isPostOwner) {
            throw new appError("You are not allowed to delete this comment", 403);
        }

        return (await postRepository.removeComment(postId, commentId)) as IPost;
    }

    async getPostsByAuthor(authorId: string): Promise<IPost[]> {
        return await postRepository.findByAuthor(authorId);
    }

    /** Posts from people the user follows + the user's own posts. */
    async getFeed(user: IUser, page?: number, limit?: number): Promise<IPost[]> {
        const ids = [user.id as string, ...user.following.map((id) => id.toString())];
        return await postRepository.getFeed(ids, page, limit);
    }
}
