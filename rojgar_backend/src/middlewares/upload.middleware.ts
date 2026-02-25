import path from "path";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE = 5 * 1024 * 1024;

const PROFILE_UPLOAD_DIR = path.join(process.cwd(), "public", "profile_pictures");
const JOB_LOGO_UPLOAD_DIR = path.join(process.cwd(), "public", "job_logos");

if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(JOB_LOGO_UPLOAD_DIR)) {
  fs.mkdirSync(JOB_LOGO_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, PROFILE_UPLOAD_DIR);
    } else if (file.fieldname === "companyLogo") {
      cb(null, JOB_LOGO_UPLOAD_DIR);
    } else {
      cb(new Error("Invalid field name for upload."), "");
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `upload-${uuidv4()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.fieldname !== "profilePicture" && file.fieldname !== "companyLogo") {
    return cb(new Error("Invalid field name for upload."));
  }

  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const uploadCompanyLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});