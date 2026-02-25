"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadImage = exports.uploadProfilePicture = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const MAX_SIZE = 2 * 1024 * 1024;
const PROFILE_UPLOAD_DIR = path_1.default.join(process.cwd(), "public", "profile_pictures");
if (!fs_1.default.existsSync(PROFILE_UPLOAD_DIR)) {
    fs_1.default.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "profilePicture") {
            cb(null, PROFILE_UPLOAD_DIR);
        }
        else {
            cb(new Error("Invalid field name for upload."), "");
        }
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `pro-pic-${(0, uuid_1.v4)()}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.fieldname !== "profilePicture") {
        return cb(new Error("Invalid field name for upload."));
    }
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
};
exports.uploadProfilePicture = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE },
});
exports.uploadImage = exports.uploadProfilePicture;
exports.upload = exports.uploadProfilePicture;
//# sourceMappingURL=upload.middleware.js.map