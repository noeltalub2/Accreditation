import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import notificationController from "../controller/notificationController.js";

const router = Router();

router.get(
	"/",
	auth.requireAuth,
	auth.checkRole(["user", "faculty"]),
	notificationController.getNotifications
);
router.post(
	"/mark-as-read",
	auth.requireAuth,
	auth.checkRole(["user", "faculty"]),
	notificationController.markAsRead
);

export default router;
