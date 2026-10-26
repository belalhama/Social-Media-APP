import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
    /** Mongoose built-in virtual: string version of _id */
    id: string;
    username: string;
    email: string;
    password: string;
    passwordChangedAt?: Date;
    profilePicture?: string;
    bio?: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            maxlength: 160,
            default: "",
        },
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: Record<string, unknown>) => {
                delete ret.password;
                delete ret.passwordChangedAt;
                delete ret.__v;
                return ret;
            },
        },
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
