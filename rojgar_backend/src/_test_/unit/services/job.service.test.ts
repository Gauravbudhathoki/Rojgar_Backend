import { jobService } from "../../../services/job.services";
import { jobRepository } from "../../../repositories/job.repository";
import { HttpError } from "../../../errors/http-error";
import fs from "fs";

jest.mock("../../../repositories/job.repository", () => ({
  jobRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByCreatedBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("fs");

describe("JobService Unit Tests", () => {
  const userId = "user123";

  const fakeJob = {
    _id: "job123",
    jobTitle: "Software Engineer",
    companyName: "Test Company",
    location: "Kathmandu, Nepal",
    jobType: "Full-Time",
    experienceLevel: "Mid-Level",
    category: "Software Development",
    description: "A test job",
    companyLogoUrl: "company_logos/logo.png",
    createdBy: { toString: () => userId },
  } as any;

  const baseDto = {
    jobTitle: "Software Engineer",
    companyName: "Test Company",
    location: "Kathmandu, Nepal" as const,
    jobType: "Full-Time" as const,
    experienceLevel: "Mid-Level" as const,
    category: "Software Development" as const,
    description: "A test job",
    requirements: ["Node.js"],
    benefits: ["Insurance"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createJob", () => {
    it("1. should create a job without logo", async () => {
      (jobRepository.create as jest.Mock).mockResolvedValue(fakeJob);

      const result = await jobService.createJob(baseDto, userId);

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: userId, companyLogoUrl: undefined })
      );
      expect(result).toEqual(fakeJob);
    });

    it("2. should create a job with logoFile", async () => {
      (jobRepository.create as jest.Mock).mockResolvedValue(fakeJob);
      const logoFile = { filename: "logo.png" } as Express.Multer.File;

      await jobService.createJob(baseDto, userId, logoFile);

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyLogoUrl: "company_logos/logo.png" })
      );
    });

    it("3. should create a job with logoUrl when no file", async () => {
      (jobRepository.create as jest.Mock).mockResolvedValue(fakeJob);

      await jobService.createJob(baseDto, userId, undefined, "http://example.com/logo.png");

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyLogoUrl: "http://example.com/logo.png" })
      );
    });

    it("4. should prefer logoFile over logoUrl", async () => {
      (jobRepository.create as jest.Mock).mockResolvedValue(fakeJob);
      const logoFile = { filename: "file.png" } as Express.Multer.File;

      await jobService.createJob(baseDto, userId, logoFile, "http://example.com/logo.png");

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ companyLogoUrl: "company_logos/file.png" })
      );
    });
  });

  describe("getJobById", () => {
    it("5. should return job by ID", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);

      const result = await jobService.getJobById("job123");

      expect(result).toEqual(fakeJob);
    });

    it("6. should throw 404 if job not found", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(jobService.getJobById("badid")).rejects.toThrow(HttpError);
    });

    it("7. should throw HttpError with status 404", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(null);

      try {
        await jobService.getJobById("badid");
      } catch (err: any) {
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe("Job not found");
      }
    });
  });

  describe("getAllJobs", () => {
    it("8. should return paginated jobs", async () => {
      const paginatedResult = { data: [fakeJob], total: 1, page: 1, limit: 10, totalPages: 1 };
      (jobRepository.findAll as jest.Mock).mockResolvedValue(paginatedResult);

      const result = await jobService.getAllJobs({ page: 1, limit: 10 });

      expect(result).toEqual(paginatedResult);
      expect(jobRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it("9. should pass filters to repository", async () => {
      (jobRepository.findAll as jest.Mock).mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

      await jobService.getAllJobs({ jobType: "Full-Time" as const, page: 1, limit: 10 });

      expect(jobRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ jobType: "Full-Time" })
      );
    });
  });

  describe("getMyJobs", () => {
    it("10. should return jobs by user ID", async () => {
      (jobRepository.findByCreatedBy as jest.Mock).mockResolvedValue([fakeJob]);

      const result = await jobService.getMyJobs(userId);

      expect(result).toEqual([fakeJob]);
      expect(jobRepository.findByCreatedBy).toHaveBeenCalledWith(userId);
    });

    it("11. should return empty array if no jobs", async () => {
      (jobRepository.findByCreatedBy as jest.Mock).mockResolvedValue([]);

      const result = await jobService.getMyJobs(userId);

      expect(result).toEqual([]);
    });
  });

  describe("updateJob", () => {
    it("12. should update job successfully", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.update as jest.Mock).mockResolvedValue({ ...fakeJob, jobTitle: "Updated" });

      const result = await jobService.updateJob("job123", { jobTitle: "Updated" }, userId);

      expect(result.jobTitle).toBe("Updated");
    });

    it("13. should throw 404 if job not found on update", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        jobService.updateJob("badid", { jobTitle: "X" }, userId)
      ).rejects.toThrow(HttpError);
    });

    it("14. should throw 403 if user is not the owner", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);

      await expect(
        jobService.updateJob("job123", { jobTitle: "X" }, "otheruser")
      ).rejects.toThrow(HttpError);
    });

    it("15. should throw 403 with correct message if not owner", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);

      try {
        await jobService.updateJob("job123", {}, "otheruser");
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.message).toBe("You are not authorized to update this job");
      }
    });

    it("16. should update with logoFile and delete old local logo", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.update as jest.Mock).mockResolvedValue(fakeJob);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const logoFile = { filename: "newlogo.png" } as Express.Multer.File;
      await jobService.updateJob("job123", {}, userId, logoFile);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(jobRepository.update).toHaveBeenCalledWith(
        "job123",
        expect.objectContaining({ companyLogoUrl: "company_logos/newlogo.png" })
      );
    });

    it("17. should not delete old logo if it starts with http", async () => {
      const jobWithHttpLogo = { ...fakeJob, companyLogoUrl: "http://example.com/logo.png" };
      (jobRepository.findById as jest.Mock).mockResolvedValue(jobWithHttpLogo);
      (jobRepository.update as jest.Mock).mockResolvedValue(jobWithHttpLogo);

      const logoFile = { filename: "newlogo.png" } as Express.Multer.File;
      await jobService.updateJob("job123", {}, userId, logoFile);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it("18. should update with logoUrl when no file", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.update as jest.Mock).mockResolvedValue(fakeJob);

      await jobService.updateJob("job123", {}, userId, undefined, "http://new.com/logo.png");

      expect(jobRepository.update).toHaveBeenCalledWith(
        "job123",
        expect.objectContaining({ companyLogoUrl: "http://new.com/logo.png" })
      );
    });

    it("19. should throw 500 if update returns null", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(
        jobService.updateJob("job123", {}, userId)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("deleteJob", () => {
    it("20. should delete job successfully", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.delete as jest.Mock).mockResolvedValue(fakeJob);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(jobService.deleteJob("job123", userId)).resolves.toBeUndefined();
      expect(jobRepository.delete).toHaveBeenCalledWith("job123");
    });

    it("21. should throw 404 if job not found on delete", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(jobService.deleteJob("badid", userId)).rejects.toThrow(HttpError);
    });

    it("22. should throw 403 if user is not the owner on delete", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);

      await expect(
        jobService.deleteJob("job123", "otheruser")
      ).rejects.toThrow(HttpError);
    });

    it("23. should throw 403 with correct message if not owner", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);

      try {
        await jobService.deleteJob("job123", "otheruser");
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.message).toBe("You are not authorized to delete this job");
      }
    });

    it("24. should delete local logo file if exists", async () => {
      (jobRepository.findById as jest.Mock).mockResolvedValue(fakeJob);
      (jobRepository.delete as jest.Mock).mockResolvedValue(fakeJob);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await jobService.deleteJob("job123", userId);

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it("25. should not delete logo if it starts with http", async () => {
      const jobWithHttpLogo = { ...fakeJob, companyLogoUrl: "http://example.com/logo.png" };
      (jobRepository.findById as jest.Mock).mockResolvedValue(jobWithHttpLogo);
      (jobRepository.delete as jest.Mock).mockResolvedValue(jobWithHttpLogo);

      await jobService.deleteJob("job123", userId);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it("26. should not attempt to delete logo if companyLogoUrl is undefined", async () => {
      const jobNoLogo = { ...fakeJob, companyLogoUrl: undefined };
      (jobRepository.findById as jest.Mock).mockResolvedValue(jobNoLogo);
      (jobRepository.delete as jest.Mock).mockResolvedValue(jobNoLogo);

      await jobService.deleteJob("job123", userId);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});