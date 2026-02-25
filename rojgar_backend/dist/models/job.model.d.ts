import mongoose, { Document } from "mongoose";
export interface IJob extends Document {
    jobTitle: string;
    companyName: string;
    companyLogoUrl?: string | null;
    location: "Remote" | "Kathmandu, Nepal" | "Pokhara, Nepal" | "Lalitpur, Nepal" | "Bhaktapur, Nepal" | "Biratnagar, Nepal" | "Birgunj, Nepal";
    minSalary?: number | null;
    maxSalary?: number | null;
    jobType: "Full-Time" | "Part-Time" | "Contract" | "Freelance" | "Internship";
    experienceLevel: "Entry Level" | "Junior" | "Mid-Level" | "Senior" | "Lead / Principal" | "Executive";
    category: "Software Development" | "Design & Creative" | "Marketing" | "Sales" | "Finance & Accounting" | "HR & Recruitment" | "Operations" | "Customer Support" | "Data & Analytics" | "Other";
    description: string;
    requirements: string[];
    benefits: string[];
    createdBy: mongoose.Types.ObjectId;
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const JobModel: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=job.model.d.ts.map