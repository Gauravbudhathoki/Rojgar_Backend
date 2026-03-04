import { UserService } from "../../../services/admin/user.services";
import { UserRepository } from "../../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repositories/user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/env", () => ({
  JWT_SECRET: "test-secret",
}));

const mockRepo = UserRepository.prototype;

describe("UserService Unit Tests", () => {
  let userService: UserService;

  const fakeUser = {
    _id: { toString: () => "user123" },
    username: "testuser",
    email: "test@test.com",
    password: "hashedpassword",
    role: "user",
    profilePicture: "default.png",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe("getAllUsers", () => {
    it("1. should return all users", async () => {
      jest.spyOn(mockRepo, "getAllUsers").mockResolvedValue([fakeUser]);
      const result = await userService.getAllUsers();
      expect(result.length).toBe(1);
    });

    it("2. should throw 500 on repository error", async () => {
      jest.spyOn(mockRepo, "getAllUsers").mockRejectedValue(new Error("DB error"));
      await expect(userService.getAllUsers()).rejects.toThrow(HttpError);
    });
  });

  describe("getUserById", () => {
    it("3. should return user by ID", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      const result = await userService.getUserById("user123");
      expect(result.email).toBe("test@test.com");
    });

    it("4. should throw 404 if user not found by ID", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);
      await expect(userService.getUserById("fakeid")).rejects.toThrow(HttpError);
    });
  });

  describe("registerUser", () => {
    it("5. should register a new user successfully", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(null);
      jest.spyOn(mockRepo, "createUser").mockResolvedValue(fakeUser);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await userService.registerUser({
        username: "testuser",
        email: "test@test.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(result.email).toBe("test@test.com");
    });

    it("6. should throw 403 if email already in use", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(fakeUser);

      await expect(
        userService.registerUser({
          username: "testuser",
          email: "test@test.com",
          password: "pass123",
          confirmPassword: "pass123",
        })
      ).rejects.toThrow(HttpError);
    });

    it("7. should hash password before saving", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(null);
      jest.spyOn(mockRepo, "createUser").mockResolvedValue(fakeUser);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedpassword");

      await userService.registerUser({
        username: "testuser",
        email: "test@test.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(bcryptjs.hash).toHaveBeenCalledWith("password123", 10);
    });
  });

  describe("LoginUser", () => {
    it("8. should login user and return token", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(fakeUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mock-token");

      const result = await userService.LoginUser({
        email: "test@test.com",
        password: "password123",
      });

      expect(result.token).toBe("mock-token");
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("test@test.com");
    });

    it("9. should throw 401 if user not found", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(null);

      await expect(
        userService.LoginUser({ email: "no@test.com", password: "pass" })
      ).rejects.toThrow(HttpError);
    });

    it("10. should throw 401 for invalid password", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue(fakeUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.LoginUser({ email: "test@test.com", password: "wrongpass" })
      ).rejects.toThrow(HttpError);
    });

    it("11. should throw 500 if user has no password", async () => {
      jest.spyOn(mockRepo, "getUserbyEmail").mockResolvedValue({ ...fakeUser, password: undefined });

      await expect(
        userService.LoginUser({ email: "test@test.com", password: "pass" })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("updateUser", () => {
    it("12. should update user successfully", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue({ ...fakeUser, username: "updated" });

      const result = await userService.updateUser("user123", { username: "updated" });
      expect(result.username).toBe("updated");
    });

    it("13. should throw 404 if user not found on update", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

      await expect(
        userService.updateUser("fakeid", { username: "updated" })
      ).rejects.toThrow(HttpError);
    });

    it("14. should hash password when updating", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue(fakeUser);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("newhashed");

      await userService.updateUser("user123", { password: "newpassword" });
      expect(bcryptjs.hash).toHaveBeenCalledWith("newpassword", 10);
    });

    it("15. should throw 500 if updateUser returns null", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue(null);

      await expect(
        userService.updateUser("user123", { username: "updated" })
      ).rejects.toThrow(HttpError);
    });
  });

  describe("deleteUser", () => {
    it("16. should delete user successfully", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "deleteUser").mockResolvedValue(true);

      const result = await userService.deleteUser("user123");
      expect(result).toBe(true);
    });

    it("17. should throw 404 if user not found on delete", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

      await expect(userService.deleteUser("fakeid")).rejects.toThrow(HttpError);
    });
  });

  describe("updateUserStatus", () => {
    it("18. should update user status to inactive", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue({ ...fakeUser, status: "inactive" });

      const result = await userService.updateUserStatus("user123", "inactive");
      expect(result?.status).toBe("inactive");
    });

    it("19. should update user status to banned", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue({ ...fakeUser, status: "banned" });

      const result = await userService.updateUserStatus("user123", "banned");
      expect(result?.status).toBe("banned");
    });

    it("20. should throw 404 if user not found on status update", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

      await expect(
        userService.updateUserStatus("fakeid", "active")
      ).rejects.toThrow(HttpError);
    });
  });

  describe("updateUserRole", () => {
    it("21. should update user role to admin", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue({ ...fakeUser, role: "admin" });

      const result = await userService.updateUserRole("user123", "admin");
      expect(result?.role).toBe("admin");
    });

    it("22. should throw 404 if user not found on role update", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

      await expect(
        userService.updateUserRole("fakeid", "admin")
      ).rejects.toThrow(HttpError);
    });
  });

  describe("changeUserPassword", () => {
    it("23. should change password successfully", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      jest.spyOn(mockRepo, "updateUser").mockResolvedValue(fakeUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (bcryptjs.hash as jest.Mock).mockResolvedValue("newhashed");

      const result = await userService.changeUserPassword("user123", {
        currentPassword: "oldpass",
        newPassword: "newpass123",
      });
      expect(bcryptjs.hash).toHaveBeenCalledWith("newpass123", 10);
      expect(result).toBeDefined();
    });

    it("24. should throw 404 if user not found", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(null);

      await expect(
        userService.changeUserPassword("fakeid", {
          currentPassword: "old",
          newPassword: "new",
        })
      ).rejects.toThrow(HttpError);
    });

    it("25. should throw 401 if current password is incorrect", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue(fakeUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.changeUserPassword("user123", {
          currentPassword: "wrongpass",
          newPassword: "newpass123",
        })
      ).rejects.toThrow(HttpError);
    });

    it("26. should throw 500 if user has no password", async () => {
      jest.spyOn(mockRepo, "getUserById").mockResolvedValue({ ...fakeUser, password: undefined });

      await expect(
        userService.changeUserPassword("user123", {
          currentPassword: "old",
          newPassword: "new",
        })
      ).rejects.toThrow(HttpError);
    });
  });
});