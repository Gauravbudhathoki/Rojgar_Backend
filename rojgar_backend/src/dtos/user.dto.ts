
import { z } from "zod";

export const CreateUserDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["jobseeker", "employer", "admin"]).optional().default("jobseeker"),
  profilePicture: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional().default("India")
  }).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().optional(),
  education: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

export const UpdateUserDto = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  role: z.enum(["jobseeker", "employer", "admin"]).optional(),
  profilePicture: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().optional(),
  education: z.string().optional(),
  isActive: z.boolean().optional()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;