import z from 'zod'; 

export const UserSchema = z.object({
    fullname: z.string().min(3), 
    email: z.email(), 
    password : z.string().min(6), 
    role: z.enum(['admin', 'user']).default('user'),
});

export type UserType = z.infer<typeof UserSchema>;

//espaxi models ma janey ho user.model.ts ma 

