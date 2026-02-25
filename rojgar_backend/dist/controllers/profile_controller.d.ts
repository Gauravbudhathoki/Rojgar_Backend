import { Request, Response } from "express";
interface AuthRequest extends Request {
    user?: {
        id: string;
    };
    file?: Express.Multer.File;
}
export declare const uploadProfilePicture: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=profile_controller.d.ts.map