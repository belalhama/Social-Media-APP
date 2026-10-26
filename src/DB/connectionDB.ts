import mongoose from "mongoose";

const connectionDB = async (uri: string): Promise<void> => {
    try {
        await mongoose.connect(uri);
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

export default connectionDB;
