import { Request, Response, NextFunction } from "express";
import { jobController } from "../../../controllers/job.controllers";
import { jobService } from "../../../services/job.services";

jest.mock("../../../services/job.services", () => ({
  jobService: {
    createJob: jest.fn(),
    getJobById: jest.fn(),
    getAllJobs: jest.fn(),
    getMyJobs: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
  },
}));

describe("Job Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const fakeJob = {
    _id: "job123",
    jobTitle: "Software Engineer",
    companyName: "Test Company",
    location: "Kathmandu, Nepal",
    jobType: "Full-Time",
    experienceLevel: "Mid-Level",
    category: "Software Development",
    description: "A test job",
    minSalary: 50000,
    maxSalary: 80000,
    requirements: ["Node.js", "TypeScript"],
    benefits: ["Health Insurance"],
    postedBy: "user123",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      file: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("createJob", () => {
    it("1. should return 201 on success", async () => {
      (req as any).user = { id: "user123" };
      req.body = {
        jobTitle: "Software Engineer",
        companyName: "Test Company",
        location: "Kathmandu, Nepal",
        jobType: "Full-Time",
        experienceLevel: "Mid-Level",
        category: "Software Development",
        description: "A test job",
        minSalary: "50000",
        maxSalary: "80000",
        requirements: ["Node.js"],
        benefits: ["Health Insurance"],
      };
      (jobService.createJob as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.createJob(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Job created successfully" }));
    });

    it("2. should call next on error", async () => {
      (req as any).user = { id: "user123" };
      req.body = {};
      (jobService.createJob as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.createJob(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("3. should parse string requirements and benefits into arrays", async () => {
      (req as any).user = { id: "user123" };
      req.body = {
        jobTitle: "Dev",
        companyName: "Co",
        requirements: "Node.js",
        benefits: "Insurance",
      };
      (jobService.createJob as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.createJob(req as Request, res as Response, next);

      expect(jobService.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: ["Node.js"],
          benefits: ["Insurance"],
        }),
        "user123",
        undefined,
        undefined
      );
    });

    it("4. should pass logoFile and companyLogoUrl to service", async () => {
      (req as any).user = { id: "user123" };
      (req as any).file = { filename: "logo.png" };
      req.body = { companyLogoUrl: "http://logo.com/img.png" };
      (jobService.createJob as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.createJob(req as Request, res as Response, next);

      expect(jobService.createJob).toHaveBeenCalledWith(
        expect.any(Object),
        "user123",
        { filename: "logo.png" },
        "http://logo.com/img.png"
      );
    });
  });

  describe("getJobById", () => {
    it("5. should return 200 on success", async () => {
      req.params = { id: "job123" };
      (jobService.getJobById as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.getJobById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: fakeJob }));
    });

    it("6. should return 404 if job not found", async () => {
      req.params = { id: "badid" };
      (jobService.getJobById as jest.Mock).mockResolvedValue(null);

      await jobController.getJobById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Job not found" }));
    });

    it("7. should call next on error", async () => {
      req.params = { id: "job123" };
      (jobService.getJobById as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.getJobById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getAllJobs", () => {
    it("8. should return 200 with jobs", async () => {
      req.query = { page: "1", limit: "10" };
      (jobService.getAllJobs as jest.Mock).mockResolvedValue({ jobs: [fakeJob], total: 1 });

      await jobController.getAllJobs(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("9. should use default page and limit if not provided", async () => {
      req.query = {};
      (jobService.getAllJobs as jest.Mock).mockResolvedValue({ jobs: [], total: 0 });

      await jobController.getAllJobs(req as Request, res as Response, next);

      expect(jobService.getAllJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 })
      );
    });

    it("10. should pass filters to service", async () => {
      req.query = { jobType: "Full-Time", category: "Software Development", experienceLevel: "Mid-Level", location: "Kathmandu, Nepal" };
      (jobService.getAllJobs as jest.Mock).mockResolvedValue({ jobs: [fakeJob], total: 1 });

      await jobController.getAllJobs(req as Request, res as Response, next);

      expect(jobService.getAllJobs).toHaveBeenCalledWith(
        expect.objectContaining({ jobType: "Full-Time", category: "Software Development", location: "Kathmandu, Nepal" })
      );
    });

    it("11. should call next on error", async () => {
      req.query = {};
      (jobService.getAllJobs as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.getAllJobs(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getMyJobs", () => {
    it("12. should return 200 with user jobs", async () => {
      (req as any).user = { id: "user123" };
      (jobService.getMyJobs as jest.Mock).mockResolvedValue([fakeJob]);

      await jobController.getMyJobs(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [fakeJob] }));
    });

    it("13. should call next on error", async () => {
      (req as any).user = { id: "user123" };
      (jobService.getMyJobs as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.getMyJobs(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("updateJob", () => {
    it("14. should return 200 on success", async () => {
      req.params = { id: "job123" };
      (req as any).user = { id: "user123" };
      req.body = { jobTitle: "Updated Title", minSalary: "60000" };
      (jobService.updateJob as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.updateJob(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Job updated successfully" }));
    });

    it("15. should return 404 if job not found", async () => {
      req.params = { id: "badid" };
      (req as any).user = { id: "user123" };
      req.body = {};
      (jobService.updateJob as jest.Mock).mockResolvedValue(null);

      await jobController.updateJob(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Job not found or update failed" }));
    });

    it("16. should pass logoFile and companyLogoUrl to service", async () => {
      req.params = { id: "job123" };
      (req as any).user = { id: "user123" };
      (req as any).file = { filename: "newlogo.png" };
      req.body = { companyLogoUrl: "http://logo.com/new.png" };
      (jobService.updateJob as jest.Mock).mockResolvedValue(fakeJob);

      await jobController.updateJob(req as Request, res as Response, next);

      expect(jobService.updateJob).toHaveBeenCalledWith(
        "job123",
        expect.any(Object),
        "user123",
        { filename: "newlogo.png" },
        "http://logo.com/new.png"
      );
    });

    it("17. should call next on error", async () => {
      req.params = { id: "job123" };
      (req as any).user = { id: "user123" };
      req.body = {};
      (jobService.updateJob as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.updateJob(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("deleteJob", () => {
    it("18. should return 200 on success", async () => {
      req.params = { id: "job123" };
      (req as any).user = { id: "user123" };
      (jobService.deleteJob as jest.Mock).mockResolvedValue(true);

      await jobController.deleteJob(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Job deleted successfully" }));
    });

    it("19. should call next on error", async () => {
      req.params = { id: "job123" };
      (req as any).user = { id: "user123" };
      (jobService.deleteJob as jest.Mock).mockRejectedValue(new Error("DB error"));

      await jobController.deleteJob(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});