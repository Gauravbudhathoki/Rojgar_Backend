import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

describe("User Repository Integration Tests", () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    const mongoUri =
      process.env.MONGODB_URI?.replace("/rojgar", "/rojgar_test") ??
      "mongodb://127.0.0.1:27017/rojgar_test";
    await mongoose.connect(mongoUri);
    userRepository = new UserRepository();
  }, 30000);

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }, 30000);

  const baseUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
    role: "user" as const,
  };

  describe("createUser", () => {
    test("1. should create a new user", async () => {
      const user = await userRepository.createUser(baseUser);
      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBe(baseUser.email);
    });

    test("2. should default role to user", async () => {
      const user = await userRepository.createUser(baseUser);
      expect(user.role).toBe("user");
    });

    test("3. should create user with custom role admin", async () => {
      const user = await userRepository.createUser({
        ...baseUser,
        email: "admin@example.com",
        role: "admin",
      });
      expect(user.role).toBe("admin");
    });
  });

  describe("getUserbyEmail", () => {
    test("4. should get user by email after creation", async () => {
      await userRepository.createUser(baseUser);
      const user = await userRepository.getUserbyEmail(baseUser.email);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(baseUser.email);
    });

    test("5. should return null for non-existing email", async () => {
      const user = await userRepository.getUserbyEmail("notexist@example.com");
      expect(user).toBeNull();
    });

    test("6. should return password field with select", async () => {
      await userRepository.createUser(baseUser);
      const user = await userRepository.getUserbyEmail(baseUser.email);
      expect(user?.password).toBeDefined();
    });
  });

  describe("getUserbyUsername", () => {
    test("7. should get user by username after creation", async () => {
      await userRepository.createUser(baseUser);
      const user = await userRepository.getUserbyUsername(baseUser.username!);
      expect(user).not.toBeNull();
      expect(user?.username).toBe(baseUser.username);
    });

    test("8. should return null for non-existing username", async () => {
      const user = await userRepository.getUserbyUsername("nonexistentuser");
      expect(user).toBeNull();
    });
  });

  describe("getUserById", () => {
    test("9. should get user by ID after creation", async () => {
      const created = await userRepository.createUser(baseUser);
      const user = await userRepository.getUserById(created._id.toString());
      expect(user).not.toBeNull();
      expect(user?._id.toString()).toBe(created._id.toString());
    });

    test("10. should return null for non-existing ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const user = await userRepository.getUserById(fakeId);
      expect(user).toBeNull();
    });
  });

  describe("getAllUsers", () => {
    test("11. should return all users", async () => {
      await userRepository.createUser(baseUser);
      await userRepository.createUser({ ...baseUser, email: "u2@example.com", username: "user2" });
      const users = await userRepository.getAllUsers();
      expect(users.length).toBe(2);
    });

    test("12. should return empty array when no users exist", async () => {
      const users = await userRepository.getAllUsers();
      expect(users.length).toBe(0);
    });
  });

  describe("updateUser", () => {
    test("13. should update user details", async () => {
      const user = await userRepository.createUser(baseUser);
      const updated = await userRepository.updateUser(user._id.toString(), {
        username: "updateduser",
      });
      expect(updated?.username).toBe("updateduser");
    });

    test("14. should update user role", async () => {
      const user = await userRepository.createUser(baseUser);
      const updated = await userRepository.updateUser(user._id.toString(), {
        role: "admin",
      });
      expect(updated?.role).toBe("admin");
    });

    test("15. should return null for non-existing ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await userRepository.updateUser(fakeId, { username: "X" });
      expect(result).toBeNull();
    });

    test("16. should keep fields unchanged when updated with empty object", async () => {
      const user = await userRepository.createUser(baseUser);
      const updated = await userRepository.updateUser(user._id.toString(), {});
      expect(updated?._id.toString()).toBe(user._id.toString());
      expect(updated?.email).toBe(user.email);
    });
  });

  describe("deleteUser", () => {
    test("17. should delete user by ID and return true", async () => {
      const user = await userRepository.createUser(baseUser);
      const result = await userRepository.deleteUser(user._id.toString());
      expect(result).toBe(true);
      const found = await userRepository.getUserById(user._id.toString());
      expect(found).toBeNull();
    });

    test("18. should return null for non-existing user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await userRepository.deleteUser(fakeId);
      expect(result).toBeNull();
    });
  });

  describe("getUsersByRole", () => {
    test("19. should return users with role user", async () => {
      await userRepository.createUser(baseUser);
      await userRepository.createUser({
        ...baseUser,
        email: "admin@example.com",
        username: "adminuser",
        role: "admin",
      });
      const users = await userRepository.getUsersByRole("user");
      expect(users.length).toBe(1);
      expect(users[0].role).toBe("user");
    });

    test("20. should return users with role admin", async () => {
      await userRepository.createUser(baseUser);
      await userRepository.createUser({
        ...baseUser,
        email: "admin@example.com",
        username: "adminuser",
        role: "admin",
      });
      const users = await userRepository.getUsersByRole("admin");
      expect(users.length).toBe(1);
      expect(users[0].role).toBe("admin");
    });

    test("21. should return empty array if no users with given role", async () => {
      await userRepository.createUser(baseUser);
      const users = await userRepository.getUsersByRole("admin");
      expect(users.length).toBe(0);
    });
  });

  describe("verifyUser", () => {
    test("22. should set isVerified to true", async () => {
      const user = await userRepository.createUser(baseUser);
      const verified = await userRepository.verifyUser(user._id.toString());
      expect(verified).not.toBeNull();
    });

    test("23. should return null for non-existing user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await userRepository.verifyUser(fakeId);
      expect(result).toBeNull();
    });
  });

  describe("getUserByPhone", () => {
    test("24. should get user by phone number", async () => {
      await userRepository.createUser({ ...baseUser, phone: "9800000001" });
      const user = await userRepository.getUserByPhone("9800000001");
      expect(user).not.toBeNull();
      expect(user?.phone).toBe("9800000001");
    });

    test("25. should return null for non-existing phone", async () => {
      const user = await userRepository.getUserByPhone("0000000000");
      expect(user).toBeNull();
    });
  });

  describe("workflows", () => {
    test("26. create + update + get by ID workflow", async () => {
      const user = await userRepository.createUser(baseUser);
      await userRepository.updateUser(user._id.toString(), { username: "workflow_user" });
      const fetched = await userRepository.getUserById(user._id.toString());
      expect(fetched?.username).toBe("workflow_user");
    });

    test("27. create + delete + verify deleted workflow", async () => {
      const user = await userRepository.createUser(baseUser);
      await userRepository.deleteUser(user._id.toString());
      const found = await userRepository.getUserById(user._id.toString());
      expect(found).toBeNull();
    });

    test("28. create multiple + delete one + check total", async () => {
      const u1 = await userRepository.createUser(baseUser);
      await userRepository.createUser({ ...baseUser, email: "u2@example.com", username: "user2" });
      await userRepository.deleteUser(u1._id.toString());
      const users = await userRepository.getAllUsers();
      expect(users.length).toBe(1);
    });

    test("29. create + verify + get by email workflow", async () => {
      const user = await userRepository.createUser(baseUser);
      await userRepository.verifyUser(user._id.toString());
      const fetched = await userRepository.getUserbyEmail(baseUser.email);
      expect(fetched?.isVerified).toBe(true);
    });

    test("30. create + getUsersByRole + update role workflow", async () => {
      const user = await userRepository.createUser(baseUser);
      const before = await userRepository.getUsersByRole("user");
      expect(before.length).toBe(1);
      await userRepository.updateUser(user._id.toString(), { role: "admin" });
      const after = await userRepository.getUsersByRole("admin");
      expect(after.length).toBe(1);
    });
  });
});