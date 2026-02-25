import { z } from "zod";
export declare const CreateAdminDTO: z.ZodObject<{
    fullName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodOptional<z.ZodString>;
    profilePicture: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        admin: "admin";
    }>>>;
}, z.core.$strip>;
export type CreateAdminDTO = z.infer<typeof CreateAdminDTO>;
export declare const LoginAdminDTO: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginAdminDTO = z.infer<typeof LoginAdminDTO>;
//# sourceMappingURL=admin.dto.d.ts.map