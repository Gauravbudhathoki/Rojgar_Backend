import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";

const userRepository = new UserRepository();

export class AdminUserService {

    async createUser(data: CreateUserDto) {
        const checkEmail = await userRepository.getUserbyEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);

        const { confirmPassword, ...userData } = data;

        const newUser = await userRepository.createUser({
            ...userData,
            password: hashedPassword
        });

        return newUser;
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserbyId(id);
        if (!user) throw new HttpError(404, "User not found");
        return user;
    }

    async getAllUsers() {
        return await userRepository.getAllUsers();
    }

    async updateUser(id: string, data: UpdateUserDto) {

        if (data.password) {
            data.password = await bcryptjs.hash(data.password, 10);
        }

        const updated = await userRepository.updateUser(id, data);
        if (!updated) throw new HttpError(404, "User not found");

        return updated;
    }

    async deleteUser(id: string) {
        const result = await userRepository.deleteUser(id);
        if (!result) throw new HttpError(404, "User not found");
        return true;
    }
}