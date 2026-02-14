// FILE: src/repositories/user/user.repository.ts

import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserbyUsername(username: string): Promise<IUser | null>;
    getUserbyEmail(email: string): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean | null>;
    getUsersByRole(role: 'admin' | 'user'): Promise<IUser[]>;
    verifyUser(id: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }

    async getUserbyEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ email: email });
        return user;
    }

    async getUserbyUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ username: username });
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }

    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getUsersByRole(role: 'admin' | 'user'): Promise<IUser[]> {
        const users = await UserModel.find({ role: role });
        return users;
    }

    async verifyUser(id: string): Promise<IUser | null> {
        const verifiedUser = await UserModel.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        );
        return verifiedUser;
    }

    async getUserByPhone(phone: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ phone: phone });
        return user;
    }
} 