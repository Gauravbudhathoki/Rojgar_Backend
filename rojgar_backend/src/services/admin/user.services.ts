import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";

const userRepository = new UserRepository();

export class UserService {
    getAllUsers() {
        throw new Error("Method not implemented.");
    }
    deleteUser(userId: string) {
        throw new Error("Method not implemented.");
    }
    
    async updateUser(userId: string, updatePayload: Partial<UpdateUserDto> & { profilePicture?: string }) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (updatePayload.password) {
            updatePayload.password = await bcryptjs.hash(updatePayload.password, 10);
        }

        const updatedUser = await userRepository.updateUser(userId, updatePayload);
        
        if (!updatedUser) {
            throw new HttpError(500, "Failed to update user");
        }

        return updatedUser;
    }

    async registerUser(data: CreateUserDto) {
        console.log('Registering user with email:', data.email);
        const checkEmail = await userRepository.getUserbyEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);

        const { confirmPassword, ...userData } = data;

        const newUser = await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
        
        console.log('User registered successfully:', newUser.email);
        return newUser;
    }

    async LoginUser(data: LoginUserDto) {
        console.log('Login attempt with email:', data.email);
        
        const existingUser = await userRepository.getUserbyEmail(data.email);
        console.log('User found:', existingUser ? 'Yes' : 'No');

        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        if (!existingUser.password) {
            throw new HttpError(500, "User record missing password");
        }

        console.log('Comparing passwords...');
        const isPasswordValid = await bcryptjs.compare(
            data.password,
            existingUser.password
        );
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

        return { token, existingUser };
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }
}