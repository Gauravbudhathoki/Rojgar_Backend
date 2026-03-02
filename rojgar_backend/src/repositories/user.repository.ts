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
        return await UserModel.findOne({ email }).select("+password");
    }

    async getUserbyUsername(username: string): Promise<IUser | null> {
        return await UserModel.findOne({ username });
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }

    async getAllUsers(): Promise<IUser[]> {
        return await UserModel.find();
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getUsersByRole(role: 'admin' | 'user'): Promise<IUser[]> {
        return await UserModel.find({ role });
    }

    async verifyUser(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    }

    async getUserByPhone(phone: string): Promise<IUser | null> {
        return await UserModel.findOne({ phone });
    }
}