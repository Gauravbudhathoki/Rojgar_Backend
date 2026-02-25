import { IUser } from "../models/user.model";
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
export declare class UserRepository implements IUserRepository {
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserbyEmail(email: string): Promise<IUser | null>;
    getUserbyUsername(username: string): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean | null>;
    getUsersByRole(role: 'admin' | 'user'): Promise<IUser[]>;
    verifyUser(id: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;
}
//# sourceMappingURL=user.repository.d.ts.map