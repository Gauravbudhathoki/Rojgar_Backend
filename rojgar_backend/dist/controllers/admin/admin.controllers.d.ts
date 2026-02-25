import { Request, Response, NextFunction } from "express";
export declare class AdminController {
    registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAdminProfile(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updateAdminProfile(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAllAdmins(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAdminById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=admin.controllers.d.ts.map