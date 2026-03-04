import { Request, Response, NextFunction } from "express";
import { authorizedMiddleware, isAdmin } from "../../../middlewares/authorization.middlewares";
import jwt from "jsonwebtoken";
import { UserModel } from "../../../models/user.model";
import { AdminModel } from "../../../models/admin/admin.model";

jest.mock("jsonwebtoken");
jest.mock("../../../models/user.model");
jest.mock("../../../models/admin/admin.model");
jest.mock("../../../config/env", () => ({ JWT_SECRET: "test-secret" }));

const mockRequest = (headers = {}, user?: any) =>
  ({ headers, user } as unknown as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next: NextFunction = jest.fn();

const fakeUser = { _id: "user123", role: "user", _id_toString: "user123" } as any;
const fakeAdmin = { _id: "admin123", role: "admin" } as any;

describe("Authorization Middleware Unit Tests", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("authorizedMiddleware", () => {
    it("1. should return 401 if no Authorization header", async () => {
      const req = mockRequest({});
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Not authorized" })
      );
    });

    it("2. should return 401 if Authorization header does not start with Bearer", async () => {
      const req = mockRequest({ authorization: "Basic sometoken" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Not authorized" })
      );
    });

    it("3. should return 401 if token is invalid", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("invalid"); });
      const req = mockRequest({ authorization: "Bearer badtoken" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Invalid token" })
      );
    });

    it("4. should return 401 if decoded token has no id", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({});
      const req = mockRequest({ authorization: "Bearer token" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Invalid token" })
      );
    });

    it("5. should return 401 if user no longer exists", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
      (AdminModel.findById as jest.Mock).mockResolvedValue(null);
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      const req = mockRequest({ authorization: "Bearer token" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "User no longer exists" })
      );
    });

    it("6. should call next() and set req.user for valid regular user token", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
      (AdminModel.findById as jest.Mock).mockResolvedValue(null);
      (UserModel.findById as jest.Mock).mockResolvedValue({
        ...fakeUser,
        _id: { toString: () => "user123" },
        role: "user",
      });
      const req = mockRequest({ authorization: "Bearer validtoken" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user!.role).toBe("user");
    });

    it("7. should set req.isAdmin=false for regular user", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
      (AdminModel.findById as jest.Mock).mockResolvedValue(null);
      (UserModel.findById as jest.Mock).mockResolvedValue({
        ...fakeUser,
        _id: { toString: () => "user123" },
        role: "user",
      });
      const req = mockRequest({ authorization: "Bearer validtoken" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(req.isAdmin).toBe(false);
    });

    it("8. should call next() and set req.isAdmin=true for admin user", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "admin123" });
      (AdminModel.findById as jest.Mock).mockResolvedValue({
        ...fakeAdmin,
        _id: { toString: () => "admin123" },
      });
      const req = mockRequest({ authorization: "Bearer admintoken" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.isAdmin).toBe(true);
      expect(req.user!.role).toBe("admin");
    });

    it("9. should set isAdmin=true if user model role is admin", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user123" });
      (AdminModel.findById as jest.Mock).mockResolvedValue(null);
      (UserModel.findById as jest.Mock).mockResolvedValue({
        ...fakeUser,
        _id: { toString: () => "user123" },
        role: "admin",
      });
      const req = mockRequest({ authorization: "Bearer token" });
      const res = mockResponse();
      await authorizedMiddleware(req, res, next);
      expect(req.isAdmin).toBe(true);
      expect(req.user!.role).toBe("admin");
    });
  });

  describe("isAdmin", () => {
    it("10. should call next() if user is admin via role", () => {
      const req = mockRequest({}, { role: "admin" });
      const res = mockResponse();
      isAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("11. should call next() if req.isAdmin is true", () => {
      const req = { ...mockRequest({}, { role: "user" }), isAdmin: true } as unknown as Request;
      const res = mockResponse();
      isAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("12. should return 403 if user is not admin", () => {
      const req = mockRequest({}, { role: "user" });
      const res = mockResponse();
      isAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Forbidden: Admin access required" })
      );
    });

    it("13. should return 403 if req.user is undefined", () => {
      const req = mockRequest({});
      const res = mockResponse();
      isAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Forbidden: Admin access required" })
      );
    });
  });
});