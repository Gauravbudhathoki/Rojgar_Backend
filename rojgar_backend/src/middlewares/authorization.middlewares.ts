import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/env";
import { UserModel as User } from "../models/user.model";
import { AdminModel as Admin } from "../models/admin/admin.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id: any;
        role: "user" | "admin";
      };
      isAdmin?: boolean;
    }
  }
}

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const adminUser = await Admin.findById(decoded.id);
    if (adminUser) {
      req.user = {
        id: adminUser._id.toString(),
        _id: adminUser._id,
        role: "admin",
      };
      req.isAdmin = true;
      return next();
    }

    const regularUser = await User.findById(decoded.id);
    if (!regularUser) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    const role = regularUser.role?.trim() as "user" | "admin";
    const isAdmin = role === "admin";

    req.user = {
      id: regularUser._id.toString(),
      _id: regularUser._id,
      role,
    };
    req.isAdmin = isAdmin;

    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || (!req.isAdmin && req.user.role !== "admin")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  next();
};