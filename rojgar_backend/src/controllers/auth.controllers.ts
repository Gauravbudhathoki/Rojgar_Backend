import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRE } from "../config/env";
import { UserModel as User } from "../models/user.model";
import { AdminModel as Admin } from "../models/admin/admin.model";

export const register = async (req: Request, res: Response) => {
  const { fullName, email, password, username } = req.body as {
    fullName?: string;
    username?: string;
    email: string;
    password: string;
  };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username || fullName || email.split("@")[0],
      email,
      password: hashedPassword,
      profilePicture: "default-profile.png",
      role: "user",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        role: newUser.role,
      },
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email/Username and password are required",
    });
  }

  try {
    let user = await User.findOne({
      $or: [{ email }, { username: email }],
    }).select("+password");

    let isAdmin = false;

    if (!user) {
      const admin = await Admin.findOne({
        $or: [{ email }, { username: email }],
      }).select("+password");

      if (admin) {
        user = admin;
        isAdmin = true;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const role = isAdmin ? "admin" : (user.role?.trim() ?? "user");

    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE || "7d" } as any
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          role,
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    let user = await User.findById(userId).select("-password");

    if (!user) {
      const admin = await Admin.findById(userId).select("-password");
      if (admin) {
        return res.status(200).json({
          success: true,
          data: {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            profilePicture: admin.profilePicture,
            role: "admin",
          },
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role?.trim() ?? "user",
      },
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};