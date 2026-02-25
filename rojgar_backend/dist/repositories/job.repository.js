"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const job_model_1 = require("../models/job.model");
class JobRepository {
    async create(data) {
        const job = new job_model_1.JobModel({ ...data });
        return await job.save();
    }
    async findById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await job_model_1.JobModel.findById(id).populate("createdBy", "username email profilePicture");
    }
    async findAll(query) {
        const { jobType, category, experienceLevel, location, page = 1, limit = 10, } = query;
        const filter = {};
        if (jobType)
            filter.jobType = jobType;
        if (category)
            filter.category = category;
        if (experienceLevel)
            filter.experienceLevel = experienceLevel;
        if (location)
            filter.location = { $regex: location, $options: "i" };
        const skip = (page - 1) * limit;
        const total = await job_model_1.JobModel.countDocuments(filter);
        const data = await job_model_1.JobModel.find(filter)
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
    async findByCreatedBy(createdBy) {
        return await job_model_1.JobModel.find({ createdBy })
            .populate("createdBy", "username email profilePicture")
            .sort({ createdAt: -1 });
    }
    async update(id, data) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        const updateData = { ...data };
        return await job_model_1.JobModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "username email profilePicture");
    }
    async delete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await job_model_1.JobModel.findByIdAndDelete(id);
    }
}
exports.jobRepository = new JobRepository();
//# sourceMappingURL=job.repository.js.map