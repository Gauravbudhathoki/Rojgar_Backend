"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controllers_1 = require("../../controllers/admin/admin.controllers");
const authorization_middlewares_1 = require("../../middlewares/authorization.middlewares");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const router = (0, express_1.Router)();
const adminController = new admin_controllers_1.AdminController();
// Public admin routes (no admin access required)
router.post("/register", adminController.registerAdmin.bind(adminController));
router.post("/login", adminController.loginAdmin.bind(adminController));
// Apply authentication to all admin routes
router.use(authorization_middlewares_1.authorizedMiddleware);
// Apply admin access check to protected routes
router.use(authorization_middlewares_1.isAdmin);
// Admin profile and management routes (protected)
router.get("/profile", adminController.getAdminProfile.bind(adminController));
router.put("/profile", adminController.updateAdminProfile.bind(adminController));
router.get("/", adminController.getAllAdmins.bind(adminController));
router.get("/:adminId", adminController.getAdminById.bind(adminController));
router.delete("/:adminId", adminController.deleteAdmin.bind(adminController));
// User Management Routes for Admin
router.get("/users/all", adminController.getAllUsers.bind(adminController));
router.get("/users/:userId", adminController.getUserById.bind(adminController));
router.post("/users", upload_middleware_1.uploadProfilePicture.single('profilePicture'), adminController.createUser.bind(adminController));
router.put("/users/:userId", upload_middleware_1.uploadProfilePicture.single('profilePicture'), adminController.updateUser.bind(adminController));
router.delete("/users/:userId", adminController.deleteUser.bind(adminController));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map