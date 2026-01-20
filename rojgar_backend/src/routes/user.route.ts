import { Router } from "express";
import { AdminUserController } from "../controllers/admin/admin.controllers";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const adminUserController = new AdminUserController();
const router = Router();

router.get("/", authorizedMiddleware, adminUserController.getAllUsers);
router.get("/:id", authorizedMiddleware, adminUserController.getUserById);
router.post("/", authorizedMiddleware, adminUserController.createUser);
router.put("/:id", authorizedMiddleware, adminUserController.updateOneUser);
router.delete("/:id", authorizedMiddleware, adminUserController.deleteOneUser);

export default router;