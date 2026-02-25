import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    profilePicture: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>>;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const CreateUserDto: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export type CreateUserDto = z.infer<typeof CreateUserDto>;
export declare const LoginUserDto: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginUserDto = z.infer<typeof LoginUserDto>;
export declare const UpdateUserDto: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    profilePicture: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    role: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>>>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    confirmPassword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
//# sourceMappingURL=user.dto.d.ts.map