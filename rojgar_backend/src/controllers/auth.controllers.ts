import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel as User } from "../models/user.model";

export const register = async (req: Request, res: Response) => {
  const { fullName, email, password, username } = req.body as {
    fullName?: string;
    username?: string;
    email: string;
    password: string;
  };

  console.log('=== REGISTER ATTEMPT ===');
  console.log('Username:', username);
  console.log('FullName:', fullName);
  console.log('Email:', email);
  console.log('Password received:', password ? 'Yes' : 'No');

  if (!email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', existingUser ? 'Email already exists' : 'Email available');
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const newUser = await User.create({
      username: username || fullName || email.split('@')[0],
      email,
      password: hashedPassword,
      profilePicture: "default-profile.png",
    });

    console.log('User created successfully:', newUser.email);

    return res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email/Username:', email);
  console.log('Password received:', password ? 'Yes' : 'No');
  console.log('Password value:', password);

  if (!email || !password) {
    console.log('Missing email/username or password');
    return res.status(400).json({ 
      success: false,
      message: "Email/Username and password required" 
    });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }
      ]
    }).select("+password");

    console.log('User found in DB:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User email:', user.email);
      console.log('User username:', user.username);
      console.log('Stored password hash exists:', !!user.password);
      console.log('Stored password hash:', user.password);
    }

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRE || "7d" } as any
    );

    console.log('Login successful for:', user.email);
    console.log('Token generated');

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};