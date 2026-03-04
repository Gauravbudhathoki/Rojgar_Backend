import mongoose from "mongoose";
import { jobRepository } from "../../../repositories/job.repository";
import { JobModel } from "../../../models/job.model";
import { UserModel } from "../../../models/user.model";
import dotenv from "dotenv";

dotenv.config();

const createTestUser = async () => {
  const user = new UserModel({
    username: "testuser",
    email: `testuser_${Date.now()}@test.com`,
    password: "hashedpassword123",
    role: "user",
  });
  return await user.save();
};

describe("Job Repository Integration Tests", () => {
  let userId: string;

  beforeAll(async () => {
    const mongoUri =
      process.env.MONGODB_URI?.replace("/rojgar", "/rojgar_test") ??
      "mongodb://127.0.0.1:27017/rojgar_test";
    await mongoose.connect(mongoUri);
  }, 30000);

  beforeEach(async () => {
    await JobModel.deleteMany({});
    await UserModel.deleteMany({});
    const user = await createTestUser();
    userId = user._id.toString();
  });

  afterAll(async () => {
    await JobModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }, 30000);

  const makeJobData = (createdBy: string) => ({
    jobTitle: "Software Engineer",
    companyName: "Test Company",
    // values must conform to enums defined in DTOs/models
    location: "Kathmandu, Nepal" as const,
    jobType: "Full-Time" as const,
    experienceLevel: "Mid-Level" as const,
    category: "Software Development" as const,
    description: "A test job description",
    minSalary: 50000,
    maxSalary: 80000,
    requirements: ["Node.js", "TypeScript"],
    benefits: ["Health Insurance"],
    createdBy,
  });

  describe("create", () => {
    it("1. should create a new job", async () => {
      const job = await jobRepository.create(makeJobData(userId));
      expect(job._id).toBeDefined();
      expect(job.jobTitle).toBe("Software Engineer");
      expect(job.companyName).toBe("Test Company");
      expect(job.location).toBe("Kathmandu, Nepal");
    });

    it("2. should create a job with companyLogoUrl", async () => {
      const job = await jobRepository.create({
        ...makeJobData(userId),
        companyLogoUrl: "http://example.com/logo.png",
      });
      expect(job.companyLogoUrl).toBe("http://example.com/logo.png");
    });

    it("3. should store requirements and benefits as arrays", async () => {
      const job = await jobRepository.create(makeJobData(userId));
      expect(job.requirements).toEqual(["Node.js", "TypeScript"]);
      expect(job.benefits).toEqual(["Health Insurance"]);
    });

    it("4. should store createdBy as the user ID", async () => {
      const job = await jobRepository.create(makeJobData(userId));
      expect(job.createdBy.toString()).toBe(userId);
    });
  });

  describe("findById", () => {
    it("5. should find a job by valid ID", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      const found = await jobRepository.findById(created._id.toString());
      expect(found).not.toBeNull();
      expect(found?._id.toString()).toBe(created._id.toString());
    });

    it("6. should return null for non-existing ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const found = await jobRepository.findById(fakeId);
      expect(found).toBeNull();
    });

    it("7. should return null for invalid ID format", async () => {
      const found = await jobRepository.findById("invalid-id");
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("8. should return all jobs with default pagination", async () => {
      await jobRepository.create(makeJobData(userId));
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Backend Developer" });
      const result = await jobRepository.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it("9. should return empty data when no jobs exist", async () => {
      const result = await jobRepository.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it("10. should filter jobs by jobType", async () => {
      await jobRepository.create({ ...makeJobData(userId), jobType: "Full-Time" as const });
      await jobRepository.create({ ...makeJobData(userId), jobType: "Part-Time" as const });
      const result = await jobRepository.findAll({ jobType: "Full-Time" as const, page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.data[0].jobType).toBe("Full-Time");
    });

    it("11. should filter jobs by category", async () => {
      await jobRepository.create({ ...makeJobData(userId), category: "Software Development" as const });
      await jobRepository.create({ ...makeJobData(userId), category: "Finance & Accounting" as const });
      const result = await jobRepository.findAll({ category: "Software Development" as const, page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
    });

    it("12. should filter jobs by experienceLevel", async () => {
      await jobRepository.create({ ...makeJobData(userId), experienceLevel: "Mid-Level" as const });
      await jobRepository.create({ ...makeJobData(userId), experienceLevel: "Senior" as const });
      const result = await jobRepository.findAll({ experienceLevel: "Senior" as const, page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
    });

    it("13. should filter jobs by location case-insensitively", async () => {
      await jobRepository.create({ ...makeJobData(userId), location: "Kathmandu, Nepal" });
      await jobRepository.create({ ...makeJobData(userId), location: "Pokhara, Nepal" });
      const result = await jobRepository.findAll({ location: "kathmandu", page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.data[0].location).toBe("Kathmandu, Nepal");
    });

    it("14. should paginate results correctly", async () => {
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 1" });
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 2" });
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 3" });
      const result = await jobRepository.findAll({ page: 1, limit: 2 });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    it("15. should return second page correctly", async () => {
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 1" });
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 2" });
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Job 3" });
      const result = await jobRepository.findAll({ page: 2, limit: 2 });
      expect(result.data.length).toBe(1);
      expect(result.page).toBe(2);
    });

    it("16. should return empty array when page exceeds total", async () => {
      await jobRepository.create(makeJobData(userId));
      const result = await jobRepository.findAll({ page: 99, limit: 10 });
      expect(result.data.length).toBe(0);
    });
  });

  describe("findByCreatedBy", () => {
    it("17. should return jobs created by a specific user", async () => {
      await jobRepository.create(makeJobData(userId));
      await jobRepository.create({ ...makeJobData(userId), jobTitle: "Another Job" });
      const jobs = await jobRepository.findByCreatedBy(userId);
      expect(jobs.length).toBe(2);
    });

    it("18. should return empty array if user has no jobs", async () => {
      const otherId = new mongoose.Types.ObjectId().toString();
      const jobs = await jobRepository.findByCreatedBy(otherId);
      expect(jobs.length).toBe(0);
    });
  });

  describe("update", () => {
    it("19. should update a job by ID", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      const updated = await jobRepository.update(created._id.toString(), {
        jobTitle: "Updated Engineer",
      });
      expect(updated).not.toBeNull();
      expect(updated?.jobTitle).toBe("Updated Engineer");
    });

    it("20. should return null for non-existing ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      // provide a valid update payload so validators don't throw before checking existence
      const result = await jobRepository.update(fakeId, { jobTitle: "Valid Title" });
      expect(result).toBeNull();
    });

    it("21. should return null for invalid ID format", async () => {
      const result = await jobRepository.update("invalid-id", { jobTitle: "X" });
      expect(result).toBeNull();
    });

    it("22. should update companyLogoUrl", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      const updated = await jobRepository.update(created._id.toString(), {
        companyLogoUrl: "http://example.com/newlogo.png",
      });
      expect(updated?.companyLogoUrl).toBe("http://example.com/newlogo.png");
    });

    it("23. should update salary range", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      const updated = await jobRepository.update(created._id.toString(), {
        minSalary: 60000,
        maxSalary: 90000,
      });
      expect(updated?.minSalary).toBe(60000);
      expect(updated?.maxSalary).toBe(90000);
    });
  });

  describe("delete", () => {
    it("24. should delete a job by ID and return it", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      const deleted = await jobRepository.delete(created._id.toString());
      expect(deleted).not.toBeNull();
      expect(deleted?._id.toString()).toBe(created._id.toString());
      const found = await jobRepository.findById(created._id.toString());
      expect(found).toBeNull();
    });

    it("25. should return null for non-existing ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await jobRepository.delete(fakeId);
      expect(result).toBeNull();
    });

    it("26. should return null for invalid ID format", async () => {
      const result = await jobRepository.delete("invalid-id");
      expect(result).toBeNull();
    });

    it("27. create + delete + verify deleted workflow", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      await jobRepository.delete(created._id.toString());
      const found = await jobRepository.findById(created._id.toString());
      expect(found).toBeNull();
    });

    it("28. create + update + delete workflow", async () => {
      const created = await jobRepository.create(makeJobData(userId));
      await jobRepository.update(created._id.toString(), { jobTitle: "Workflow Job" });
      const deleted = await jobRepository.delete(created._id.toString());
      expect(deleted?.jobTitle).toBe("Workflow Job");
    });
  });
});