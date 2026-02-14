// FILE: src/services/admin/admin.service.ts

import { AdminRepository } from "../../repositories/admin/admin.repository";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";
import { IAdmin } from "../../models/admin/admin.model";

const adminRepository = new AdminRepository();
const userRepository = new UserRepository();

export class AdminService {
    async registerAdmin(data: any) {
        try {
            const existingUser = await userRepository.getUserbyEmail(data.email);
            const existingAdmin = await adminRepository.getUserbyEmail(data.email);
            
            if (existingUser || existingAdmin) {
                throw new HttpError(409, "Email already in use");
            }

            let fullName = data.fullName;
            if (typeof fullName !== 'string' || fullName.trim().length === 0) {
                throw new HttpError(400, "Full name is required");
            }
            fullName = fullName.trim();
            
            if (!data.password || data.password.length < 6) {
                throw new HttpError(400, "Password must be at least 6 characters long");
            }

            if (data.confirmPassword && data.password !== data.confirmPassword) {
                throw new HttpError(400, "Passwords do not match");
            }

            const hashedPassword = await bcryptjs.hash(data.password, 10);

            const adminData: Partial<IAdmin> = {
                email: data.email.toLowerCase().trim(),
                fullName: fullName.trim(),
                password: hashedPassword,
                role: 'admin',
                profilePicture: data.profilePicture?.trim()
            };

            const newAdmin = await adminRepository.createUser(adminData);
            
            if (!newAdmin) {
                throw new HttpError(500, "Failed to create admin account");
            }

            return newAdmin;
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new HttpError(500, "Error during admin registration");
        }
    }

    async loginAdmin(data: any) {
        const admin = await adminRepository.getUserbyEmail(data.email);
        if (!admin) {
            throw new HttpError(404, "Admin not found");
        }

        const isPasswordValid = await bcryptjs.compare(data.password, admin.password);
        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return { token, admin };
    }

    async updateAdminProfile(adminId: string, updateData: any) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new HttpError(404, "Admin not found");
        }

        const updatedAdmin = await adminRepository.updateOneAdmin(adminId, updateData);
        return updatedAdmin;
    }

    async getAdminById(adminId: string) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new HttpError(404, "Admin not found");
        }
        return admin;
    }

    async getAllAdmins() {
        const admins = await adminRepository.getAllAdmins();
        return admins;
    }

    async deleteAdmin(adminId: string) {
        const admin = await adminRepository.getUserById(adminId);
        if (!admin) {
            throw new HttpError(404, "Admin not found");
        }

        const result = await adminRepository.deleteOneAdmin(adminId);
        return result;
    }
}