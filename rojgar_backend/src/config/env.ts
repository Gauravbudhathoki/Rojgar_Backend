import dotenv from "dotenv";
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV as string;
export const PORT = Number(process.env.PORT) || 5050;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rojgar";
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRE = process.env.JWT_EXPIRE as string;
export const JWT_COOKIE_EXPIRE = Number(process.env.JWT_COOKIE_EXPIRE);
export const FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH as string;
export const MAX_FILE_UPLOAD = Number(process.env.MAX_FILE_UPLOAD);
export const PROFILE_PICTURE_PATH = process.env.PROFILE_PICTURE_PATH as string;
export const MAX_PROFILE_PICTURE_SIZE = Number(
  process.env.MAX_PROFILE_PICTURE_SIZE
);
export const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",") || [];
export const DEFAULT_PROFILE_PICTURE = process.env.DEFAULT_PROFILE_PICTURE as string;

export const RESUME_UPLOAD_PATH = process.env.RESUME_UPLOAD_PATH as string;
export const MAX_RESUME_SIZE = Number(process.env.MAX_RESUME_SIZE);
export const COMPANY_LOGO_PATH = process.env.COMPANY_LOGO_PATH as string;
export const MAX_COMPANY_LOGO_SIZE = Number(process.env.MAX_COMPANY_LOGO_SIZE);