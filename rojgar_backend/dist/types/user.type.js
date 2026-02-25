"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_error_1 = require("../errors/http-error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const userRepository = new user_repository_1.UserRepository();
class UserService {
    getAllUsers() {
        throw new Error("Method not implemented.");
    }
    deleteUser(userId) {
        throw new Error("Method not implemented.");
    }
    // Fully implemented Update method
    async updateUser(userId, updatePayload) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        // If password is being updated, hash it
        if (updatePayload.password) {
            updatePayload.password = await bcryptjs_1.default.hash(updatePayload.password, 10);
        }
        const updatedUser = await userRepository.updateUser(userId, updatePayload);
        if (!updatedUser) {
            throw new http_error_1.HttpError(500, "Failed to update user");
        }
        return updatedUser;
    }
    async registerUser(data) {
        const checkEmail = await userRepository.getUserbyEmail(data.email);
        if (checkEmail) {
            throw new http_error_1.HttpError(403, "Email already in use");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        // Destructure to remove confirmPassword and keep the rest (fullName, email, etc.)
        const { confirmPassword, ...userData } = data;
        return await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
    }
    async LoginUser(data) {
        const existingUser = await userRepository.getUserbyEmail(data.email);
        if (!existingUser) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        if (!existingUser.password) {
            throw new http_error_1.HttpError(500, "User record missing password");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, existingUser.password);
        if (!isPasswordValid) {
            throw new http_error_1.HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.JWT_SECRET, { expiresIn: "30d" });
        return { token, existingUser };
    }
    async getUserById(userId) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        return user;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.type.js.map