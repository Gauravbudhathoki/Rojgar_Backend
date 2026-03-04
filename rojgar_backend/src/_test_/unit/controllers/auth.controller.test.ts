import { Request, Response } from "express";
import { register, login, requestPasswordReset, resetPassword } from "../../../controllers/auth.controllers";
import { UserModel } from "../../../models/user.model";
import { AdminModel } from "../../../models/admin/admin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../../../models/user.model");
jest.mock("../../../models/admin/admin.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
  }),
}));
jest.mock("../../../config/env", () => ({
  JWT_SECRET: "testsecret",
  JWT_EXPIRE: "7d",
}));

describe("Auth Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const fakeUser = {
    _id: "user123",
    username: "testuser",
    email: "test@test.com",
    password: "hashedpass",
    profilePicture: "default-profile.png",
    role: "user",
    passwordResetToken: undefined as any,
    passwordResetExpires: undefined as any,
    save: jest.fn().mockResolvedValue(true),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("register", () => {
    it("1. should return 201 on success", async () => {
      req.body = { fullName: "Test User", email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpass");
      (UserModel.create as jest.Mock).mockResolvedValue(fakeUser);

      await register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("2. should return 400 if email is missing", async () => {
      req.body = { password: "pass123" };
      await register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email and password are required" }));
    });

    it("3. should return 400 if password is missing", async () => {
      req.body = { email: "test@test.com" };
      await register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email and password are required" }));
    });

    it("4. should return 400 if email already registered", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
      await register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email already registered" }));
    });

    it("5. should return 500 on server error", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));
      await register(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("login", () => {
    it("6. should return 200 on success", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("7. should return 400 if email is missing", async () => {
      req.body = { password: "pass123" };
      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email/Username and password are required" }));
    });

    it("8. should return 400 if password is missing", async () => {
      req.body = { email: "test@test.com" };
      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email/Username and password are required" }));
    });

    it("9. should return 401 if user not found", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      (AdminModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid credentials" }));
    });

    it("10. should return 401 if password is incorrect", async () => {
      req.body = { email: "test@test.com", password: "wrongpass" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid credentials" }));
    });

    it("11. should login as admin if user not found but admin exists", async () => {
      req.body = { email: "admin@test.com", password: "pass123" };
      const fakeAdmin = { ...fakeUser, role: "admin" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      (AdminModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(fakeAdmin) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("admintoken");

      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("12. should return 500 on server error", async () => {
      req.body = { email: "test@test.com", password: "pass123" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockRejectedValue(new Error("DB error")) });
      await login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("requestPasswordReset", () => {
    it("13. should return 400 if email is missing", async () => {
      req.body = {};
      await requestPasswordReset(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email is required" }));
    });

    it("14. should return 200 even if user not found", async () => {
      req.body = { email: "notexist@test.com" };
      // simulate chained select call returning null
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await requestPasswordReset(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "If this email exists, a reset link has been sent." }));
    });

    it("15. should return 200 and send email on success", async () => {
      req.body = { email: "test@test.com" };
      const userWithSave = { ...fakeUser, save: jest.fn().mockResolvedValue(true) };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(userWithSave) });

      await requestPasswordReset(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "If this email exists, a reset link has been sent." }));
    });

    it("16. should return 500 on server error", async () => {
      req.body = { email: "test@test.com" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockRejectedValue(new Error("DB error")) });
      await requestPasswordReset(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("resetPassword", () => {
    it("17. should return 400 if password is missing", async () => {
      req.params = { token: "sometoken" };
      req.body = {};
      await resetPassword(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "New password is required" }));
    });

    it("18. should return 400 if token is invalid or expired", async () => {
      req.params = { token: "badtoken" };
      req.body = { password: "newpass123" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await resetPassword(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid or expired reset token" }));
    });

    it("19. should return 200 on successful password reset", async () => {
      req.params = { token: "validtoken" };
      req.body = { password: "newpass123" };
      const validUser = {
        ...fakeUser,
        passwordResetToken: "hashedtoken",
        passwordResetExpires: new Date(Date.now() + 900000),
        save: jest.fn().mockResolvedValue(true),
      };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(validUser) });
      (bcrypt.hash as jest.Mock).mockResolvedValue("newhash");

      await resetPassword(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Password reset successful. You can now log in." }));
    });

    it("20. should return 500 on server error", async () => {
      req.params = { token: "validtoken" };
      req.body = { password: "newpass123" };
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: jest.fn().mockRejectedValue(new Error("DB error")) });
      await resetPassword(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});