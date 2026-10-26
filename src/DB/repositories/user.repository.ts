import User, { type IUser } from "../models/user.model.js";
import { DatabaseRepository } from "./database.repository.js";

export class UserRepository extends DatabaseRepository<IUser> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await this.model.findOne({ email });
    }

    async findByUsername(username: string): Promise<IUser | null> {
        return await this.model.findOne({ username });
    }

    /** Password is `select: false`, so login must ask for it explicitly. */
    async findByEmailWithPassword(email: string): Promise<IUser | null> {
        return await this.model.findOne({ email }).select("+password");
    }

    async findByIdWithPassword(id: string): Promise<IUser | null> {
        return await this.model.findById(id).select("+password");
    }

    async findByIdWithAuthInfo(id: string): Promise<IUser | null> {
        return await this.model.findById(id).select("+passwordChangedAt");
    }

    async addFollower(userId: string, followerId: string): Promise<IUser | null> {
        return await this.model.findByIdAndUpdate(
            userId,
            { $addToSet: { followers: followerId } },
            { returnDocument: "after" }
        );
    }

    async addFollowing(userId: string, targetId: string): Promise<IUser | null> {
        return await this.model.findByIdAndUpdate(
            userId,
            { $addToSet: { following: targetId } },
            { returnDocument: "after" }
        );
    }

    async removeFollower(userId: string, followerId: string): Promise<IUser | null> {
        return await this.model.findByIdAndUpdate(
            userId,
            { $pull: { followers: followerId } },
            { returnDocument: "after" }
        );
    }

    async removeFollowing(userId: string, targetId: string): Promise<IUser | null> {
        return await this.model.findByIdAndUpdate(
            userId,
            { $pull: { following: targetId } },
            { returnDocument: "after" }
        );
    }

    async getFollowers(userId: string): Promise<IUser | null> {
        return await this.model.findById(userId).populate("followers", "username profilePicture bio");
    }

    async getFollowing(userId: string): Promise<IUser | null> {
        return await this.model.findById(userId).populate("following", "username profilePicture bio");
    }

    /** Remove a (deleted) user from everyone's followers/following lists. */
    async removeFromAllFollowLists(userId: string): Promise<void> {
        await this.model.updateMany({}, { $pull: { followers: userId, following: userId } });
    }
}
