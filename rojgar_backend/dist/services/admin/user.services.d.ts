import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
export declare class UserService {
    getAllUsers(): void;
    deleteUser(userId: string): void;
    updateUser(userId: string, updatePayload: Partial<UpdateUserDto> & {
        profilePicture?: string;
    }): Promise<import("../../models/user.model").IUser>;
    registerUser(data: CreateUserDto): Promise<import("../../models/user.model").IUser>;
    LoginUser(data: LoginUserDto): Promise<{
        token: string;
        existingUser: import("../../models/user.model").IUser;
    }>;
    getUserById(userId: string): Promise<import("../../models/user.model").IUser>;
}
//# sourceMappingURL=user.services.d.ts.map