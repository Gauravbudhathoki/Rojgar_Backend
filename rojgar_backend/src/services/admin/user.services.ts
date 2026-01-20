import { CreateUserDto, LoginUserDto } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

const userRepository = new UserRepository();

export class UserService {

    async registerUser(data: CreateUserDto) {
        const checkEmail = await userRepository.getUserbyEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }

        // const checkFullname = await userRepository.getUserbyUsername(data.fullname);
        // if (checkFullname) {
        //     throw new HttpError(403, "Username already in use");
        // }

        const hashedPassword = await bcryptjs.hash(data.password, 10);

        const { confirmPassword, ...userData } = data;

        return await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
    }

    async LoginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserbyEmail(data.email);

        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        const isPasswordValid = await bcryptjs.compare(
            data.password,
            existingUser.password
        );

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
}