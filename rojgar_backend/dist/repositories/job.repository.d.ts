import { IJob } from "../models/job.model";
import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobQuery, PaginatedJobs } from "../types/job.type";
declare class JobRepository {
    create(data: CreateJobDto & {
        companyLogoUrl?: string;
        createdBy: string;
    }): Promise<IJob>;
    findById(id: string): Promise<IJob | null>;
    findAll(query: JobQuery): Promise<PaginatedJobs<IJob>>;
    findByCreatedBy(createdBy: string): Promise<IJob[]>;
    update(id: string, data: UpdateJobDto & {
        companyLogoUrl?: string;
    }): Promise<IJob | null>;
    delete(id: string): Promise<IJob | null>;
}
export declare const jobRepository: JobRepository;
export {};
//# sourceMappingURL=job.repository.d.ts.map