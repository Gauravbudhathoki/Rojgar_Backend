import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: any;
            isAdmin?: boolean;
        }
    }
}
export declare const authorizedMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorization.middlewares.d.ts.map