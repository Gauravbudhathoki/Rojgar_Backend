"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = exports.LoginUserDto = exports.CreateUserDto = exports.UserSchema = void 0;
const zod_1 = require("zod");
// Base user schema to reuse in multiple DTOs
exports.UserSchema = zod_1.z.object({
    username: zod_1.z.string().min(2, "Username is required"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    profilePicture: zod_1.z.string().url("Invalid URL format").optional().nullable(),
    role: zod_1.z.enum(["user", "admin"]).optional().default("user"),
    imageUrl: zod_1.z.string().optional().nullable(),
});
// CREATE USER DTO
exports.CreateUserDto = exports.UserSchema.pick({
    username: true,
    email: true,
    password: true,
}).extend({
    confirmPassword: zod_1.z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
// LOGIN DTO
exports.LoginUserDto = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password is required"),
});
// UPDATE USER DTO
// Use partial() so all fields are optional for updates
exports.UpdateUserDto = exports.UserSchema.partial().extend({
    confirmPassword: zod_1.z.string().min(6, "Confirm password is required").optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
//# sourceMappingURL=user.dto.js.map