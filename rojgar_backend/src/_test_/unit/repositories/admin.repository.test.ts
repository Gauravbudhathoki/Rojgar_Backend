import mongoose from "mongoose";
import { AdminRepository } from "../../../repositories/admin/admin.repository";
import { AdminModel } from "../../../models/admin/admin.model";
import dotenv from "dotenv";

dotenv.config();

describe("Admin Repository Integration Tests", () => {
  let adminRepository: AdminRepository;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI?.replace("/rojgar", "/rojgar_test")
      ?? "mongodb://127.0.0.1:27017/rojgar_test";
    await mongoose.connect(mongoUri);
    adminRepository = new AdminRepository();
  });

  beforeEach(async () => {
    await AdminModel.deleteMany({});
  });

  afterAll(async () => {
    await AdminModel.deleteMany({});
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }, 30000);

  const baseAdmin = {
    fullName: "Admin User",
    email: "admin@test.com",
    password: "hashedpassword123",
    role: "admin" as const,
  };

  it("1. should create a new admin", async () => {
    const admin = await adminRepository.createUser(baseAdmin);
    expect(admin._id).toBeDefined();
    expect(admin.email).toBe("admin@test.com");
    expect(admin.role).toBe("admin");
  });

  it("2. should get admin by email", async () => {
    await adminRepository.createUser(baseAdmin);
    const found = await adminRepository.getUserbyEmail("admin@test.com");
    expect(found).not.toBeNull();
    expect(found?.email).toBe("admin@test.com");
  });

  it("3. should return null for non-existing email", async () => {
    const found = await adminRepository.getUserbyEmail("notexist@test.com");
    expect(found).toBeNull();
  });

  it("4. should get admin by ID", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found).not.toBeNull();
    expect(found?._id.toString()).toBe(created._id.toString());
  });

  it("5. should return null for non-existing ID", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const found = await adminRepository.getUserById(fakeId);
    expect(found).toBeNull();
  });

  it("6. should get all admins", async () => {
    await adminRepository.createUser(baseAdmin);
    await adminRepository.createUser({ ...baseAdmin, email: "admin2@test.com" });
    const admins = await adminRepository.getAllAdmins();
    expect(admins.length).toBe(2);
  });

  it("7. should return empty array when no admins exist", async () => {
    const admins = await adminRepository.getAllAdmins();
    expect(admins.length).toBe(0);
  });

  it("8. should update admin by ID", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const updated = await adminRepository.updateOneAdmin(created._id.toString(), { fullName: "Updated Admin" });
    expect(updated?.fullName).toBe("Updated Admin");
  });

  it("9. should return null when updating non-existing admin", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await adminRepository.updateOneAdmin(fakeId, { fullName: "X" });
    expect(result).toBeNull();
  });

  it("10. should delete admin by ID and return true", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const result = await adminRepository.deleteOneAdmin(created._id.toString());
    expect(result).toBe(true);
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found).toBeNull();
  });

  it("11. should return null when deleting non-existing admin", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const result = await adminRepository.deleteOneAdmin(fakeId);
    expect(result).toBeNull();
  });

  it("12. create + update + get workflow", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    await adminRepository.updateOneAdmin(created._id.toString(), { fullName: "Workflow Admin" });
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found?.fullName).toBe("Workflow Admin");
  });

  it("13. create + delete + verify deleted workflow", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    await adminRepository.deleteOneAdmin(created._id.toString());
    const found = await adminRepository.getUserById(created._id.toString());
    expect(found).toBeNull();
  });

  it("14. should update email of existing admin", async () => {
    const created = await adminRepository.createUser(baseAdmin);
    const updated = await adminRepository.updateOneAdmin(created._id.toString(), { email: "updated@test.com" });
    expect(updated?.email).toBe("updated@test.com");
  });

  it("15. should get all admins returns correct count after delete", async () => {
    const first = await adminRepository.createUser(baseAdmin);
    await adminRepository.createUser({ ...baseAdmin, email: "admin2@test.com" });
    await adminRepository.deleteOneAdmin(first._id.toString());
    const admins = await adminRepository.getAllAdmins();
    expect(admins.length).toBe(1);
  });
});