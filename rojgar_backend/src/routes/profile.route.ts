import { Router } from "express";
import {
  uploadProfilePicture,
  getMyProfile,
  updateUser,
  getUserById,
} from "../controllers/profile_controller";
import { uploadProfilePicture as upload } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.get("/me", authorizedMiddleware, getMyProfile);

router.put(
  "/upload",
  authorizedMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);

router.patch(
  "/update",
  authorizedMiddleware,
  updateUser
);

router.get("/:userId", authorizedMiddleware, getUserById);

export default router;