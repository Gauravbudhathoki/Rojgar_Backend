import mongoose from "mongoose";
import { JobModel, IJob } from "../models/job.model";
import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobQuery, PaginatedJobs } from "../types/job.type";

class JobRepository {
  async create(
    data: CreateJobDto & { companyLogoUrl?: string; createdBy: string }
  ): Promise<IJob> {
    const job = new JobModel({ ...data });
    return await job.save();
  }

  async findById(id: string): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await JobModel.findById(id).populate(
      "createdBy",
      "username email profilePicture"
    );
  }

  async findAll(query: JobQuery): Promise<PaginatedJobs<IJob>> {
    const {
      jobType,
      category,
      experienceLevel,
      location,
      page = 1,
      limit = 10,
    } = query;

    const filter: Record<string, unknown> = {};
    if (jobType) filter.jobType = jobType;
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = { $regex: location, $options: "i" };

    const skip = (page - 1) * limit;
    const total = await JobModel.countDocuments(filter);
    const data = await JobModel.find(filter)
      .populate("createdBy", "username email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCreatedBy(createdBy: string): Promise<IJob[]> {
    return await JobModel.find({ createdBy })
      .populate("createdBy", "username email profilePicture")
      .sort({ createdAt: -1 });
  }

  async update(
    id: string,
    data: UpdateJobDto & { companyLogoUrl?: string }
  ): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData: Record<string, unknown> = { ...data };
    return await JobModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "username email profilePicture");
  }

  async delete(id: string): Promise<IJob | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await JobModel.findByIdAndDelete(id);
  }
}

export const jobRepository = new JobRepository();