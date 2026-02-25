"use strict";
// FILE: src/services/admin/admin.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_repository_1 = require("../../repositories/admin/admin.repository");
const user_repository_1 = require("../../repositories/user.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_error_1 = require("../../errors/http-error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const adminRepository = new admin_repository_1.AdminRepository();
const userRepository = new user_repository_1.UserRepository();
class AdminService {
    async registerAdmin(data) {
        try {
            const existingUser = await userRepository.getUserbyEmail(data.email);
            const existingAdmin = await adminRepository.getUserbyEmail(data.email);
            if (existingUser || existingAdmin) {
                throw new http_error_1.HttpError(409, "Email already in use");
            }
            let fullName = data.fullName;
            if (typeof fullName !== 'string' || fullName.trim().length === 0) {
                throw new http_error_1.HttpError(400, "Full name is required");
            }
            fullName = fullName.trim();
            if (!data.password || data.password.length < 6) {
                throw new http_error_1.HttpError(400, "Password must be at least 6 characters long");
            }
            if (data.confirmPassword && data.password !== data.confirmPassword) {
                throw new http_error_1.HttpError(400, "Passwords do not match");
            }
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            const adminData = {
                email: data.email.toLowerCase().trim(),
                fullName: fullName.trim(),
                password: hashedPassword,
                role: 'admin',
                profilePicture: data.profilePicture?.trim()
            };
            const newAdmin = await adminRepository.createUser(adminData);
            if (!newAdmin) {
                throw new http_error_1.HttpError(500, "Failed to create admin account");
            }
            return newAdmin;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                throw error;
            }
            throw new http_error_1.HttpError(500, "Error during admin registration");
        }
    }
    async loginAdmin(data) {
        const admin = await adminRepository.getUserbyEmail(data.email);
        if (!admin) {
            throw new http_error_1.HttpError(404, "Admin not found");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, admin.password);
        if (!isPasswordValid) {
            throw new http_error_1.HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.JWT_SECRET, { expiresIn: '30d' });
        return { token, admin };
    }
    async updateAdminProfile(adminId, updateData) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new http_error_1.HttpError(404, "Admin not found");
        }
        const updatedAdmin = await adminRepository.updateOneAdmin(adminId, updateData);
        return updatedAdmin;
    }
    async getAdminById(adminId) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new http_error_1.HttpError(404, "Admin not found");
        }
        return admin;
    }
    async getAllAdmins() {
        const admins = await adminRepository.getAllAdmins();
        return admins;
    }
    async deleteAdmin(adminId) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new http_error_1.HttpError(404, "Admin not found");
        }
        const result = await adminRepository.deleteOneAdmin(adminId);
        return result;
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.user.services.js.map