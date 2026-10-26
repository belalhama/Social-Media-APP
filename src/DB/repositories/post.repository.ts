import Post, { type IPost } from "../models/post.model.js";
import { DatabaseRepository } from "./database.repository.js";

export class PostRepository extends DatabaseRepository<IPost> {
    constructor() {
        super(Post);
    }

    async findByAuthor(authorId: string): Promise<IPost[]> {
        return await this.model
            .find({ author: authorId })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 });
    }

    async findAllPaginated(page: number = 1, limit: number = 20): Promise<IPost[]> {
        const skip = (page - 1) * limit;
        return await this.model
            .find()
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async findByIdPopulated(id: string): Promise<IPost | null> {
        return await this.model
            .findById(id)
            .populate("author", "username profilePicture")
            .populate("comments.user", "username profilePicture");
    }

    async removeComment(postId: string, commentId: string): Promise<IPost | null> {
        return await this.model.findByIdAndUpdate(
            postId,
            { $pull: { comments: { _id: commentId } } },
            { returnDocument: "after" }
        );
    }

    async deleteByAuthor(authorId: string): Promise<void> {
        await this.model.deleteMany({ author: authorId });
    }

    /** Remove a deleted user's likes and comments from all posts. */
    async removeUserActivity(userId: string): Promise<void> {
        await this.model.updateMany({}, { $pull: { likes: userId, comments: { user: userId } } });
    }

    async getFeed(userIds: string[], page: number = 1, limit: number = 20): Promise<IPost[]> {
        const skip = (page - 1) * limit;
        return await this.model
            .find({ author: { $in: userIds } })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async toggleLike(postId: string, userId: string): Promise<IPost | null> {
        const post = await this.model.findById(postId);
        if (!post) return null;

        const hasLiked = post.likes.some((id) => id.toString() === userId);

        if (hasLiked) {
            return await this.model.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } },
                { returnDocument: "after" }
            );
        } else {
            return await this.model.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId } },
                { returnDocument: "after" }
            );
        }
    }

    async addComment(
        postId: string,
        userId: string,
        text: string
    ): Promise<IPost | null> {
        return await this.model.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: { user: userId, text, createdAt: new Date() },
                },
            },
            { returnDocument: "after" }
        );
    }
}
