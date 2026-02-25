import { Router, Request, Response, NextFunction } from "express";
import { jobController } from "../controllers/job.controllers";
import { upload } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get("/my", authorizedMiddleware, asyncHandler(jobController.getMyJobs.bind(jobController)));

router.get("/", asyncHandler(jobController.getAllJobs.bind(jobController)));

router.get("/:id", asyncHandler(jobController.getJobById.bind(jobController)));

router.post("/", authorizedMiddleware, upload.single("companyLogo"), asyncHandler(jobController.createJob.bind(jobController)));

router.put("/:id", authorizedMiddleware, upload.single("companyLogo"), asyncHandler(jobController.updateJob.bind(jobController)));

router.delete("/:id", authorizedMiddleware, asyncHandler(jobController.deleteJob.bind(jobController)));

export default router;