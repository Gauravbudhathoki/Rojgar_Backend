"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAdminDTO = exports.CreateAdminDTO = void 0;
const zod_1 = require("zod");
exports.CreateAdminDTO = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name is required").optional().nullable(),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(6, "Confirm password is required").optional(),
    profilePicture: zod_1.z.string().url("Invalid URL format").optional().nullable(),
    role: zod_1.z.enum(["admin"]).optional().default("admin")
}).refine((data) => {
    // Only validate password matching if confirmPassword is provided
    if (data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});
exports.LoginAdminDTO = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password is required")
});
//# sourceMappingURL=admin.dto.js.map