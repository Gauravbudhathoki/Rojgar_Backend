import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.services";
import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobQuery } from "../types/job.type";

function parseArrayField(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

class JobController {
  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body;

      const dto: CreateJobDto = {
        jobTitle: body.jobTitle,
        companyName: body.companyName,
        location: body.location,
        jobType: body.jobType,
        experienceLevel: body.experienceLevel,
        category: body.category,
        description: body.description,
        minSalary: body.minSalary ? Number(body.minSalary) : undefined,
        maxSalary: body.maxSalary ? Number(body.maxSalary) : undefined,
        requirements: parseArrayField(body.requirements),
        benefits: parseArrayField(body.benefits),
      };

      const userId = req.user!.id;
      const logoFile = req.file;
      const companyLogoUrl = body.companyLogoUrl as string | undefined;

      const job = await jobService.createJob(dto, userId, logoFile, companyLogoUrl);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await jobService.getJobById(req.params.id);

      if (!job) {
        res.status(404).json({ success: false, message: "Job not found" });
        return;
      }

      res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: JobQuery = {
        jobType: req.query.jobType as JobQuery["jobType"],
        category: req.query.category as JobQuery["category"],
        experienceLevel: req.query.experienceLevel as JobQuery["experienceLevel"],
        location: req.query.location as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await jobService.getAllJobs(query);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMyJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await jobService.getMyJobs(req.user!.id);
      res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body;

      const dto: UpdateJobDto = {
        jobTitle: body.jobTitle,
        companyName: body.companyName,
        location: body.location,
        jobType: body.jobType,
        experienceLevel: body.experienceLevel,
        category: body.category,
        description: body.description,
        minSalary: body.minSalary ? Number(body.minSalary) : undefined,
        maxSalary: body.maxSalary ? Number(body.maxSalary) : undefined,
        requirements: body.requirements ? parseArrayField(body.requirements) : undefined,
        benefits: body.benefits ? parseArrayField(body.benefits) : undefined,
      };

      const logoFile = req.file;
      const companyLogoUrl = body.companyLogoUrl as string | undefined;

      const job = await jobService.updateJob(req.params.id, dto, req.user!.id, logoFile, companyLogoUrl);

      if (!job) {
        res.status(404).json({ success: false, message: "Job not found or update failed" });
        return;
      }

      res.status(200).json({ success: true, message: "Job updated successfully", data: job });
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await jobService.deleteJob(req.params.id, req.user!.id);
      res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();