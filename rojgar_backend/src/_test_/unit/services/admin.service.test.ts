import { AdminService } from "../../../services/admin/admin.user.services";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repositories/admin/admin.repository", () => {
  const mockAdminRepo = {
    createUser: jest.fn(),
    getUserbyEmail: jest.fn(),
    getUserById: jest.fn(),
    getAllAdmins: jest.fn(),
    updateOneAdmin: jest.fn(),
    deleteOneAdmin: jest.fn(),
  };
  return {
    AdminRepository: jest.fn().mockImplementation(() => mockAdminRepo),
  };
});

jest.mock("../../../repositories/user.repository", () => {
  const mockUserRepo = {
    getUserbyEmail: jest.fn(),
  };
  return {
    UserRepository: jest.fn().mockImplementation(() => mockUserRepo),
  };
});

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/env", () => ({ JWT_SECRET: "test-secret" }));

describe("AdminService Unit Tests", () => {
  let adminService: AdminService;

  const fakeAdmin = {
    _id: "admin123",
    email: "admin@test.com",
    fullName: "Admin User",
    password: "hashedpass",
    role: "admin",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    adminService = new AdminService();
  });

  describe("registerAdmin", () => {
    it("1. should register a new admin successfully", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpass");
      mockAdminRepo.createUser.mockResolvedValue(fakeAdmin);

      const result = await adminService.registerAdmin({
        email: "admin@test.com",
        fullName: "Admin User",
        password: "password123",
      });
      expect(result).toEqual(fakeAdmin);
    });

    it("2. should throw 409 if email already in use by user", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue({ email: "admin@test.com" });
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123" })
      ).rejects.toThrow(HttpError);
    });

    it("3. should throw 409 if email already in use by admin", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123" })
      ).rejects.toThrow(HttpError);
    });

    it("4. should throw 400 if fullName is empty", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "", password: "pass123" })
      ).rejects.toThrow(HttpError);
    });

    it("5. should throw 400 if fullName is only whitespace", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "   ", password: "pass123" })
      ).rejects.toThrow(HttpError);
    });

    it("6. should throw 400 if password is too short", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "123" })
      ).rejects.toThrow(HttpError);
    });

    it("7. should throw 400 if passwords do not match", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({
          email: "admin@test.com",
          fullName: "Admin",
          password: "pass123",
          confirmPassword: "different",
        })
      ).rejects.toThrow(HttpError);
    });

    it("8. should throw 500 if createUser returns null", async () => {
      const mockUserRepo = new (require("../../../repositories/user.repository").UserRepository)();
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockUserRepo.getUserbyEmail.mockResolvedValue(null);
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpass");
      mockAdminRepo.createUser.mockResolvedValue(null);

      await expect(
        adminService.registerAdmin({ email: "admin@test.com", fullName: "Admin", password: "pass123" })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("loginAdmin", () => {
    it("9. should login admin successfully", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      const result = await adminService.loginAdmin({
        email: "admin@test.com",
        password: "password123",
      });
      expect(result.token).toBe("token123");
      expect(result.admin).toEqual(fakeAdmin);
    });

    it("10. should throw 404 if admin not found on login", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserbyEmail.mockResolvedValue(null);

      await expect(
        adminService.loginAdmin({ email: "x@test.com", password: "pass" })
      ).rejects.toThrow(HttpError);
    });

    it("11. should throw 401 if password is invalid", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserbyEmail.mockResolvedValue(fakeAdmin);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        adminService.loginAdmin({ email: "admin@test.com", password: "wrong" })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("getAdminById", () => {
    it("12. should get admin by ID", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);

      const result = await adminService.getAdminById("admin123");
      expect(result).toEqual(fakeAdmin);
    });

    it("13. should throw 404 if admin not found by ID", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(null);

      await expect(adminService.getAdminById("bad")).rejects.toThrow(HttpError);
    });
  });

  describe("updateAdminProfile", () => {
    it("14. should update admin profile successfully", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
      mockAdminRepo.updateOneAdmin.mockResolvedValue({ ...fakeAdmin, fullName: "Updated" });

      const result = await adminService.updateAdminProfile("admin123", { fullName: "Updated" });
      expect(result?.fullName).toBe("Updated");
    });

    it("15. should throw 404 if admin not found on update", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(null);

      await expect(adminService.updateAdminProfile("bad", {})).rejects.toThrow(HttpError);
    });

    it("16. should return updated admin with new email", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
      mockAdminRepo.updateOneAdmin.mockResolvedValue({ ...fakeAdmin, email: "new@test.com" });

      const result = await adminService.updateAdminProfile("admin123", { email: "new@test.com" });
      expect(result?.email).toBe("new@test.com");
    });
  });

  describe("getAllAdmins", () => {
    it("17. should get all admins", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getAllAdmins.mockResolvedValue([fakeAdmin]);

      const result = await adminService.getAllAdmins();
      expect(result).toEqual([fakeAdmin]);
      expect(result.length).toBe(1);
    });

    it("18. should return empty array if no admins", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getAllAdmins.mockResolvedValue([]);

      const result = await adminService.getAllAdmins();
      expect(result).toEqual([]);
    });
  });

  describe("deleteAdmin", () => {
    it("19. should delete admin successfully", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
      mockAdminRepo.deleteOneAdmin.mockResolvedValue(true);

      const result = await adminService.deleteAdmin("admin123");
      expect(result).toBe(true);
    });

    it("20. should throw 404 if admin not found on delete", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(null);

      await expect(adminService.deleteAdmin("bad")).rejects.toThrow(HttpError);
    });

    it("21. should return null if deleteOneAdmin returns null", async () => {
      const mockAdminRepo = new (require("../../../repositories/admin/admin.repository").AdminRepository)();
      mockAdminRepo.getUserById.mockResolvedValue(fakeAdmin);
      mockAdminRepo.deleteOneAdmin.mockResolvedValue(null);

      const result = await adminService.deleteAdmin("admin123");
      expect(result).toBeNull();
    });
  });
});