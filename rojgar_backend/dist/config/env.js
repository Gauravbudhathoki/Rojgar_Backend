"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_COMPANY_LOGO_SIZE = exports.COMPANY_LOGO_PATH = exports.MAX_RESUME_SIZE = exports.RESUME_UPLOAD_PATH = exports.DEFAULT_PROFILE_PICTURE = exports.CORS_ORIGIN = exports.MAX_PROFILE_PICTURE_SIZE = exports.PROFILE_PICTURE_PATH = exports.MAX_FILE_UPLOAD = exports.FILE_UPLOAD_PATH = exports.JWT_COOKIE_EXPIRE = exports.JWT_EXPIRE = exports.JWT_SECRET = exports.MONGODB_URI = exports.PORT = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.NODE_ENV = process.env.NODE_ENV;
exports.PORT = Number(process.env.PORT) || 5050;
exports.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rojgar";
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE;
exports.JWT_COOKIE_EXPIRE = Number(process.env.JWT_COOKIE_EXPIRE);
exports.FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH;
exports.MAX_FILE_UPLOAD = Number(process.env.MAX_FILE_UPLOAD);
exports.PROFILE_PICTURE_PATH = process.env.PROFILE_PICTURE_PATH;
exports.MAX_PROFILE_PICTURE_SIZE = Number(process.env.MAX_PROFILE_PICTURE_SIZE);
exports.CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",") || [];
exports.DEFAULT_PROFILE_PICTURE = process.env.DEFAULT_PROFILE_PICTURE;
exports.RESUME_UPLOAD_PATH = process.env.RESUME_UPLOAD_PATH;
exports.MAX_RESUME_SIZE = Number(process.env.MAX_RESUME_SIZE);
exports.COMPANY_LOGO_PATH = process.env.COMPANY_LOGO_PATH;
exports.MAX_COMPANY_LOGO_SIZE = Number(process.env.MAX_COMPANY_LOGO_SIZE);
//# sourceMappingURL=env.js.map