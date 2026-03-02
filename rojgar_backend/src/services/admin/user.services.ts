import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import { IUser } from "../../models/user.model";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";

const userRepository = new UserRepository();

export class UserService {

  async getAllUsers() {
    try {
      return await userRepository.getAllUsers();
    } catch {
      throw new HttpError(500, "Failed to fetch users");
    }
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async registerUser(data: CreateUserDto) {
    const existingEmail = await userRepository.getUserbyEmail(data.email);
    if (existingEmail) {
      throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const { confirmPassword, ...userData } = data;

    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    return newUser;
  }

  async LoginUser(data: LoginUserDto) {
    const existingUser = await userRepository.getUserbyEmail(data.email);

    if (!existingUser) {
      throw new HttpError(401, "Invalid credentials");
    }

    if (!existingUser.password) {
      throw new HttpError(500, "User record missing password");
    }

    const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role?.trim() ?? "user",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return {
      token,
      user: {
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        profilePicture: existingUser.profilePicture,
        role: payload.role,
      },
    };
  }

  async updateUser(
    userId: string,
    updatePayload: Partial<UpdateUserDto> & { profilePicture?: string }
  ) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (updatePayload.password) {
      updatePayload.password = await bcryptjs.hash(updatePayload.password, 10);
    }

    const updatedUser = await userRepository.updateUser(userId, updatePayload);
    if (!updatedUser) {
      throw new HttpError(500, "Failed to update user");
    }

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return await userRepository.deleteUser(userId);
  }

  async updateUserStatus(userId: string, status: "active" | "inactive" | "banned") {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
   
    return await userRepository.updateUser(userId, { status } as Partial<IUser>);
  }

  async updateUserRole(userId: string, role: "admin" | "user") {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return await userRepository.updateUser(userId, { role });
  }

  async changeUserPassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.password) {
      throw new HttpError(500, "User record missing password");
    }

    const isMatch = await bcryptjs.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new HttpError(401, "Current password is incorrect");
    }

    const hashed = await bcryptjs.hash(data.newPassword, 10);
    return await userRepository.updateUser(userId, { password: hashed });
  }
}