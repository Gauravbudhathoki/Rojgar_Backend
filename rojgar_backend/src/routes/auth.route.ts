import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";

let authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;