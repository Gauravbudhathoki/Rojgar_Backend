import fs from "fs";
import { jobRepository } from "../repositories/job.repository";
import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobQuery, PaginatedJobs } from "../types/job.type";
import { IJob } from "../models/job.model";
import { HttpError } from "../errors/http-error";

class JobService {
  async createJob(
    dto: CreateJobDto,
    createdBy: string,
    logoFile?: Express.Multer.File,
    logoUrl?: string
  ): Promise<IJob> {
    const companyLogoUrl = logoFile
      ? `company_logos/${logoFile.filename}`
      : logoUrl ?? undefined;
    return await jobRepository.create({ ...dto, companyLogoUrl, createdBy });
  }

  async getJobById(id: string): Promise<IJob> {
    const job = await jobRepository.findById(id);
    if (!job) throw new HttpError(404, "Job not found");
    return job;
  }

  async getAllJobs(query: JobQuery): Promise<PaginatedJobs<IJob>> {
    return await jobRepository.findAll(query);
  }

  async getMyJobs(userId: string): Promise<IJob[]> {
    return await jobRepository.findByCreatedBy(userId);
  }

  async updateJob(
    id: string,
    dto: UpdateJobDto,
    userId: string,
    logoFile?: Express.Multer.File,
    logoUrl?: string
  ): Promise<IJob> {
    const existing = await jobRepository.findById(id);
    if (!existing) throw new HttpError(404, "Job not found");
    if (existing.createdBy.toString() !== userId) {
      throw new HttpError(403, "You are not authorized to update this job");
    }

    let companyLogoUrl: string | undefined;
    if (logoFile) {
      if (existing.companyLogoUrl && !existing.companyLogoUrl.startsWith("http")) {
        const oldPath = `${process.cwd()}/public/${existing.companyLogoUrl}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      companyLogoUrl = `company_logos/${logoFile.filename}`;
    } else if (logoUrl) {
      companyLogoUrl = logoUrl;
    }

    const updated = await jobRepository.update(id, {
      ...dto,
      ...(companyLogoUrl && { companyLogoUrl }),
    });
    if (!updated) throw new HttpError(500, "Job update failed");
    return updated;
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const existing = await jobRepository.findById(id);
    if (!existing) throw new HttpError(404, "Job not found");
    if (existing.createdBy.toString() !== userId) {
      throw new HttpError(403, "You are not authorized to delete this job");
    }

    if (existing.companyLogoUrl && !existing.companyLogoUrl.startsWith("http")) {
      const filePath = `${process.cwd()}/public/${existing.companyLogoUrl}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await jobRepository.delete(id);
  }
}

export const jobService = new JobService();