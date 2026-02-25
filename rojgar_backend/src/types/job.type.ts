export type JobType = "Full-Time" | "Part-Time" | "Contract" | "Freelance" | "Internship";

export type JobCategory =
  | "Software Development"
  | "Design & Creative"
  | "Marketing"
  | "Sales"
  | "Finance & Accounting"
  | "HR & Recruitment"
  | "Operations"
  | "Customer Support"
  | "Data & Analytics"
  | "Other";

export type JobExperienceLevel =
  | "Entry Level"
  | "Junior"
  | "Mid-Level"
  | "Senior"
  | "Lead / Principal"
  | "Executive";

export interface JobQuery {
  jobType?: JobType;
  category?: JobCategory;
  experienceLevel?: JobExperienceLevel;
  location?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedJobs<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}