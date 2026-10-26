import { UserRepository } from "../../DB/repositories/user.repository.js";
import { PostRepository } from "../../DB/repositories/post.repository.js";
import type { IUser } from "../../DB/models/user.model.js";
import type { IPost } from "../../DB/models/post.model.js";
import { appError } from "../../common/middleware/globalErrorHandler.js";
import { hashPassword, comparePassword } from "../../common/utils/hash.utils.js";
import { generateToken } from "../../common/utils/token.utils.js";

const userRepository = new UserRepository();
const postRepository = new PostRepository();

interface UpdateProfileData {
    username?: string;
    bio?: string;
    profilePicture?: string;
}

export class UserService {
    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new appError("User not found", 404);
        }
        return user;
    }

    async updateProfile(userId: string, data: UpdateProfileData): Promise<IUser> {
        if (data.username) {
            const existing = await userRepository.findByUsername(data.username);
            if (existing && existing.id !== userId) {
                throw new appError("Username already exists", 409);
            }
        }

        const user = await userRepository.updateById(userId, data);
        if (!user) {
            throw new appError("User not found", 404);
        }
        return user;
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<string> {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new appError("User not found", 404);
        }

        if (!(await comparePassword(oldPassword, user.password))) {
            throw new appError("Old password is incorrect", 400);
        }

        await userRepository.updateById(userId, {
            password: await hashPassword(newPassword),
            passwordChangedAt: new Date(),
        });

        // Old tokens are now invalid, so hand back a fresh one
        return generateToken(userId);
    }

    async deleteAccount(userId: string): Promise<void> {
        await postRepository.deleteByAuthor(userId);
        await postRepository.removeUserActivity(userId);
        await userRepository.removeFromAllFollowLists(userId);
        await userRepository.deleteById(userId);
    }

    async follow(userId: string, targetId: string): Promise<IUser> {
        if (userId === targetId) {
            throw new appError("You cannot follow yourself", 400);
        }

        const target = await userRepository.findById(targetId);
        if (!target) {
            throw new appError("User not found", 404);
        }

        if (target.followers.some((id) => id.toString() === userId)) {
            throw new appError("You already follow this user", 400);
        }

        await userRepository.addFollower(targetId, userId);
        return (await userRepository.addFollowing(userId, targetId)) as IUser;
    }

    async unfollow(userId: string, targetId: string): Promise<IUser> {
        if (userId === targetId) {
            throw new appError("You cannot unfollow yourself", 400);
        }

        const target = await userRepository.findById(targetId);
        if (!target) {
            throw new appError("User not found", 404);
        }

        if (!target.followers.some((id) => id.toString() === userId)) {
            throw new appError("You do not follow this user", 400);
        }

        await userRepository.removeFollower(targetId, userId);
        return (await userRepository.removeFollowing(userId, targetId)) as IUser;
    }

    async getFollowers(userId: string): Promise<IUser["followers"]> {
        const user = await userRepository.getFollowers(userId);
        if (!user) {
            throw new appError("User not found", 404);
        }
        return user.followers;
    }

    async getFollowing(userId: string): Promise<IUser["following"]> {
        const user = await userRepository.getFollowing(userId);
        if (!user) {
            throw new appError("User not found", 404);
        }
        return user.following;
    }

    async getUserPosts(userId: string): Promise<IPost[]> {
        await this.getUserById(userId);
        return await postRepository.findByAuthor(userId);
    }
}
