import { z } from "zod";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { UserService } from "../services/admin/user.services";
import { Request, Response } from "express";

const userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, errors: parsedData.error.format() });
            }

            const newUser = await userService.registerUser(parsedData.data);

            // remove password before sending response
            let userObj: any = newUser;
            if (typeof newUser.toObject === "function") {
                userObj = newUser.toObject();
            }
            const { password, ...userWithoutPassword } = userObj;

            return res.status(201).json({ success: true, data: userWithoutPassword, message: "User registered successfully" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, errors: parsedData.error.format() });
            }

            const { token, existingUser } = await userService.LoginUser(parsedData.data!);

            // remove password before sending response
            let userObj: any = existingUser;
            if (typeof existingUser.toObject === "function") {
                userObj = existingUser.toObject();
            }
            const { password, ...userWithoutPassword } = userObj;

            return res.status(200).json({ success: true, data: { token, user: userWithoutPassword }, message: "Login successful" });
        } catch (error: Error | any) {
            return res.status(error?.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}