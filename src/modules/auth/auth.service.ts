import { UserRepository } from "../../DB/repositories/user.repository.js";
import type { IUser } from "../../DB/models/user.model.js";
import { appError } from "../../common/middleware/globalErrorHandler.js";
import { hashPassword, comparePassword } from "../../common/utils/hash.utils.js";
import { generateToken } from "../../common/utils/token.utils.js";

const userRepository = new UserRepository();

interface SignupData {
    username: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

export class AuthService {
    async signup(data: SignupData): Promise<{ user: IUser; token: string }> {
        const email = data.email.toLowerCase().trim();

        if (await userRepository.findByEmail(email)) {
            throw new appError("Email already exists", 409);
        }
        if (await userRepository.findByUsername(data.username)) {
            throw new appError("Username already exists", 409);
        }

        const user = await userRepository.create({
            username: data.username,
            email,
            password: await hashPassword(data.password),
        });

        const token = generateToken(user.id);
        return { user, token };
    }

    async login(data: LoginData): Promise<{ user: IUser; token: string }> {
        const user = await userRepository.findByEmailWithPassword(data.email.toLowerCase().trim());

        // Same message for both cases so attackers can't tell which emails exist
        if (!user || !(await comparePassword(data.password, user.password))) {
            throw new appError("Invalid email or password", 401);
        }

        const token = generateToken(user.id);
        return { user, token };
    }
}
