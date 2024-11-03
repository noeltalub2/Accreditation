import { Router } from "express";
import indexController from "../controller/indexController.js";
import auth from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", indexController.getIndex);
router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["user", "admin", "assessor"]),
	indexController.getLogout
);
router.get("/unauthorized", indexController.getError403);
router.use("/", indexController.getError404);

export default router;
