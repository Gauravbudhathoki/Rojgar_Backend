import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controllers";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middlewares";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";

const router = Router();
const adminController = new AdminController();

router.post("/register", adminController.registerAdmin.bind(adminController));
router.post("/login", adminController.loginAdmin.bind(adminController));

router.use(authorizedMiddleware);
router.use(isAdmin);

router.get("/profile", adminController.getAdminProfile.bind(adminController));
router.put("/profile", adminController.updateAdminProfile.bind(adminController));
router.get("/", adminController.getAllAdmins.bind(adminController));

router.get("/users/all", adminController.getAllUsers.bind(adminController));
router.get("/users/:userId", adminController.getUserById.bind(adminController));
router.post("/users", uploadProfilePicture.single("profilePicture"), adminController.createUser.bind(adminController));
router.put("/users/:userId", uploadProfilePicture.single("profilePicture"), adminController.updateUser.bind(adminController));
router.delete("/users/:userId", adminController.deleteUser.bind(adminController));

router.get("/:adminId", adminController.getAdminById.bind(adminController));
router.delete("/:adminId", adminController.deleteAdmin.bind(adminController));

export default router;