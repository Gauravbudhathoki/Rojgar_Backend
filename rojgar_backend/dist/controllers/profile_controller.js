"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getMyProfile = exports.updateUser = exports.uploadProfilePicture = void 0;
const user_model_1 = require("../models/user.model");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }
        const userId = req.params.userId;
        // Use findByIdAndUpdate with validateBeforeSave: false to avoid validation errors
        const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { profilePicture: req.file.filename }, { new: true, runValidators: false } // ← This prevents validation
        );
        if (!user) {
            // Delete uploaded file if user not found
            const uploadedFilePath = path_1.default.join(__dirname, "../public/profile_pictures", req.file.filename);
            if (fs_1.default.existsSync(uploadedFilePath)) {
                fs_1.default.unlinkSync(uploadedFilePath);
            }
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // Delete old profile picture if it exists
        if (user.profilePicture &&
            user.profilePicture !== "default-profile.png" &&
            user.profilePicture !== req.file.filename) {
            const oldImagePath = path_1.default.join(__dirname, "../public/profile_pictures", user.profilePicture);
            if (fs_1.default.existsSync(oldImagePath)) {
                try {
                    fs_1.default.unlinkSync(oldImagePath);
                }
                catch (err) {
                    console.error("Error deleting old profile picture:", err);
                }
            }
        }
        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    }
    catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            const uploadedFilePath = path_1.default.join(__dirname, "../public/profile_pictures", req.file.filename);
            if (fs_1.default.existsSync(uploadedFilePath)) {
                try {
                    fs_1.default.unlinkSync(uploadedFilePath);
                }
                catch (err) {
                    console.error("Error cleaning up file:", err);
                }
            }
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { profilePicture } = req.body;
        const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { profilePicture }, { new: true, runValidators: false } // Prevent validation on partial update
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateUser = updateUser;
const getMyProfile = async (req, res) => {
    try {
        const user = await user_model_1.UserModel.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getMyProfile = getMyProfile;
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=profile_controller.js.map