import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controllers";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authorizedMiddleware, getMe);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;