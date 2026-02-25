"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile_controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const authorization_middlewares_1 = require("../middlewares/authorization.middlewares");
const router = (0, express_1.Router)();
router.get("/me", authorization_middlewares_1.authorizedMiddleware, profile_controller_1.getMyProfile);
router.get("/:userId", authorization_middlewares_1.authorizedMiddleware, profile_controller_1.getUserById);
router.post("/upload-profile-picture/:userId", authorization_middlewares_1.authorizedMiddleware, upload_middleware_1.uploadProfilePicture.single("profilePicture"), profile_controller_1.uploadProfilePicture);
router.patch("/:userId", authorization_middlewares_1.authorizedMiddleware, profile_controller_1.updateUser);
exports.default = router;
//# sourceMappingURL=profile.route.js.map