"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const JobSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
exports.JobModel = mongoose_1.default.models.Job || mongoose_1.default.model("Job", JobSchema);
//# sourceMappingURL=job.model.js.map