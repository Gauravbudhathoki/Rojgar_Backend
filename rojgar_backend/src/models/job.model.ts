import mongoose, { Document, Schema } from "mongoose";

const JobSchema: Schema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      enum: [
        "Remote",
        "Kathmandu, Nepal",
        "Pokhara, Nepal",
        "Lalitpur, Nepal",
        "Bhaktapur, Nepal",
        "Biratnagar, Nepal",
        "Birgunj, Nepal",
      ],
      required: true,
    },
    minSalary: {
      type: Number,
      min: 0,
      default: null,
    },
    maxSalary: {
      type: Number,
      min: 0,
      default: null,
    },
    jobType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Junior", "Mid-Level", "Senior", "Lead / Principal", "Executive"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Software Development",
        "Design & Creative",
        "Marketing",
        "Sales",
        "Finance & Accounting",
        "HR & Recruitment",
        "Operations",
        "Customer Support",
        "Data & Analytics",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export interface IJob extends Document {
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location:
    | "Remote"
    | "Kathmandu, Nepal"
    | "Pokhara, Nepal"
    | "Lalitpur, Nepal"
    | "Bhaktapur, Nepal"
    | "Biratnagar, Nepal"
    | "Birgunj, Nepal";
  minSalary?: number | null;
  maxSalary?: number | null;
  jobType: "Full-Time" | "Part-Time" | "Contract" | "Freelance" | "Internship";
  experienceLevel: "Entry Level" | "Junior" | "Mid-Level" | "Senior" | "Lead / Principal" | "Executive";
  category:
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
  description: string;
  requirements: string[];
  benefits: string[];
  createdBy: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const JobModel =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);