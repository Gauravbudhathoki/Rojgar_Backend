import { Request, Response } from "express";
import { uploadProfilePicture, updateUser, getMyProfile, getUserById } from "../../../controllers/profile_controller";
import { UserModel } from "../../../models/user.model";
import fs from "fs";

jest.mock("../../../models/user.model");
jest.mock("fs");

describe("Profile Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  const fakeUser = {
    _id: "user123",
    username: "testuser",
    email: "test@test.com",
    profilePicture: "old-pic.png",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("uploadProfilePicture", () => {
    it("1. should return 400 if no file uploaded", async () => {
      (req as any).file = undefined;
      (req as any).user = { id: "user123" };
      await uploadProfilePicture(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Please upload an image" }));
    });

    it("2. should return 401 if user is not authenticated", async () => {
      (req as any).file = { filename: "new-pic.png" };
      (req as any).user = undefined;
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await uploadProfilePicture(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized" }));
    });

    it("3. should return 404 if user not found", async () => {
      (req as any).file = { filename: "new-pic.png" };
      (req as any).user = { id: "user123" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await uploadProfilePicture(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
    });

    it("4. should return 200 on success", async () => {
      (req as any).file = { filename: "new-pic.png" };
      (req as any).user = { id: "user123" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...fakeUser, profilePicture: "new-pic.png" });
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await uploadProfilePicture(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("5. should delete old picture if it exists and is not default", async () => {
      (req as any).file = { filename: "new-pic.png" };
      (req as any).user = { id: "user123" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...fakeUser, profilePicture: "old-pic.png" });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
      await uploadProfilePicture(req as Request, res as Response);
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("6. should return 500 on server error", async () => {
      (req as any).file = { filename: "new-pic.png" };
      (req as any).user = { id: "user123" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("DB error"));
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await uploadProfilePicture(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateUser", () => {
    it("7. should return 401 if user is not authenticated", async () => {
      (req as any).user = undefined;
      req.body = { profilePicture: "pic.png" };
      await updateUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized" }));
    });

    it("8. should return 404 if user not found", async () => {
      (req as any).user = { id: "user123" };
      req.body = { profilePicture: "pic.png" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      await updateUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
    });

    it("9. should return 200 on success", async () => {
      (req as any).user = { id: "user123" };
      req.body = { profilePicture: "pic.png" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(fakeUser);
      await updateUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("10. should return 500 on server error", async () => {
      (req as any).user = { id: "user123" };
      req.body = { profilePicture: "pic.png" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("DB error"));
      await updateUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getMyProfile", () => {
    it("11. should return 401 if user is not authenticated", async () => {
      (req as any).user = undefined;
      await getMyProfile(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized" }));
    });

    it("12. should return 404 if user not found", async () => {
      (req as any).user = { id: "user123" };
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      await getMyProfile(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
    });

    it("13. should return 200 on success", async () => {
      (req as any).user = { id: "user123" };
      (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      await getMyProfile(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("14. should return 500 on server error", async () => {
      (req as any).user = { id: "user123" };
      (UserModel.findById as jest.Mock).mockRejectedValue(new Error("DB error"));
      await getMyProfile(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getUserById", () => {
    it("15. should return 404 if user not found", async () => {
      req.params = { userId: "user123" };
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      await getUserById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
    });

    it("16. should return 200 on success", async () => {
      req.params = { userId: "user123" };
      (UserModel.findById as jest.Mock).mockResolvedValue(fakeUser);
      await getUserById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("17. should return 500 on server error", async () => {
      req.params = { userId: "user123" };
      (UserModel.findById as jest.Mock).mockRejectedValue(new Error("DB error"));
      await getUserById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});