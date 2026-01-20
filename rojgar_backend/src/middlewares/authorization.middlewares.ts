import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';

//global augementation for Express Request to include user property

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
} 

let userRepository = new UserRepository();

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // header must be in the form "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, 'Unauthorized, header malformed');
    }

    const token = authHeader.split(" ")[1]; // "Bearer <string> -> <string>"
    if (!token) {
      throw new HttpError(401, 'Unauthorized, token missing');
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>; // verify with secret
    if (!decodedToken || !decodedToken.id) {
      throw new HttpError(401, 'Unauthorized, token invalid');
    }

    const user = await userRepository.getUserbyId(decodedToken.id);
    if (!user) {
      throw new HttpError(401, 'Unauthorized, user not found');
    }

    // attach user to request object
    req.user = user;
    return next();
  } catch (error: Error | any) {
    return res.status(error.statusCode || 401).json({ success: false, message: error.message || "Unauthorized" });
  }
}
// if(req.headers && req.headers.authorization){
    //     next();
    // }else{
    //     return res.status(401).json({ message: 'Unauthorized'});
    // } 

    export const adminOnlyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.user && req.user.role === 'admin') {
          next();
      }else{
        throw new HttpError(403, 'Forbidden, admin only');
      }
    }catch(error: Error | any){
      return res.status(error.statusCode || 403).json({ success: false, message: error.message || "Forbidden" });

    }
  }