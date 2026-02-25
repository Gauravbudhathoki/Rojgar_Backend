"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authorizedMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_model_1 = require("../models/user.model");
const admin_model_1 = require("../models/admin/admin.model");
const authorizedMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized" });
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        let user = await user_model_1.UserModel.findById(decoded.id);
        let isAdmin = false;
        if (!user) {
            const admin = await admin_model_1.AdminModel.findById(decoded.id);
            if (admin) {
                user = admin;
                isAdmin = true;
            }
        }
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }
        req.user = {
            id: user._id,
            _id: user._id,
            role: isAdmin ? "admin" : "user",
        };
        req.isAdmin = isAdmin;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authorizedMiddleware = authorizedMiddleware;
const isAdmin = (req, res, next) => {
    if (!req.user || (!req.isAdmin && req.user.role !== "admin")) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admin access required",
        });
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=authorization.middlewares.js.map