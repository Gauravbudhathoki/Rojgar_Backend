import { Request, Response } from "express";
import { UserModel as User } from "../models/user.model";
import path from "path";
import fs from "fs";

interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: any;
    role: "user" | "admin";
  };
  file?: Express.Multer.File;
}

export const uploadProfilePicture = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload an image" 
      });
    }

    const userId = req.user?.id;
    
    if (!userId) {
      const uploadedFilePath = path.join(
        process.cwd(),
        "public/profile_pictures",
        req.file.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.filename },
      { new: true, runValidators: false }
    );

    if (!user) {
      const uploadedFilePath = path.join(
        process.cwd(),
        "public/profile_pictures",
        req.file.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (
      user.profilePicture &&
      user.profilePicture !== "default-profile.png" &&
      user.profilePicture !== req.file.filename
    ) {
      const oldImagePath = path.join(
        process.cwd(),
        "public/profile_pictures",
        user.profilePicture
      );

      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
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
  } catch (error) {
    if (req.file) {
      const uploadedFilePath = path.join(
        process.cwd(),
        "public/profile_pictures",
        req.file.filename
      );
      if (fs.existsSync(uploadedFilePath)) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (err) {
          console.error("Error cleaning up file:", err);
        }
      }
    }
    
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }
    
    const { profilePicture } = req.body as {
      profilePicture: string;
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true, runValidators: false }
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }
    
    const user = await User.findById(req.user.id);

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};