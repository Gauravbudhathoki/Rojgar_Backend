import { IUser, UserModel } from "../../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(data: Partial<IUser>): Promise<IUser>; 
    getUserById(id: string): Promise<IUser | null>; 
    getAllUsers(): Promise<IUser[]>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>; 
    deleteOneUser(id: string): Promise<boolean | null>; 
}

export class UserRepository implements IUserRepository {

    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data); 
        return await user.save();
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ "email": email });
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }

    async getAllUsers(): Promise<IUser[]> {
        return await UserModel.find();
    }

    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id); 
        return result ? true : null; 
    }
}