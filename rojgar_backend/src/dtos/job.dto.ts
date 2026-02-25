export interface CreateJobDto {
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location:
    | "Remote"
    | "Kathmandu, Nepal"
    | "Pokhara, Nepal"
    | "Lalitpur, Nepal"
    | "Bhaktapur, Nepal"
    | "Biratnagar, Nepal"
    | "Birgunj, Nepal";
  minSalary?: number;
  maxSalary?: number;
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
}

export interface UpdateJobDto {
  jobTitle?: string;
  companyName?: string;
  companyLogoUrl?: string;
  location?:
    | "Remote"
    | "Kathmandu, Nepal"
    | "Pokhara, Nepal"
    | "Lalitpur, Nepal"
    | "Bhaktapur, Nepal"
    | "Biratnagar, Nepal"
    | "Birgunj, Nepal";
  minSalary?: number;
  maxSalary?: number;
  jobType?: "Full-Time" | "Part-Time" | "Contract" | "Freelance" | "Internship";
  experienceLevel?: "Entry Level" | "Junior" | "Mid-Level" | "Senior" | "Lead / Principal" | "Executive";
  category?:
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
  description?: string;
  requirements?: string[];
  benefits?: string[];
}