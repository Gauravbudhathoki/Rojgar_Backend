import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const maxSize = 5 * 1024 * 1024;
const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads");
const PROFILE_DIR = path.join(UPLOAD_BASE_DIR, "profiles");
const LOGO_DIR = path.join(UPLOAD_BASE_DIR, "logos");



if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, PROFILE_DIR);
    } else if (file.fieldname === "companyLogo") {
      cb(null, LOGO_DIR);
    } else {
      cb(new Error("Invalid field name"), "");
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === "profilePicture" ? "user" : "corp";
    cb(null, `${prefix}-${uuidv4()}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg and .webp formats are allowed"));
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

export const uploadProfilePicture = uploadMedia;
export const uploadCompanyLogo = uploadMedia;
export const upload = uploadMedia;