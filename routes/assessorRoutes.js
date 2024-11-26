import { Router } from "express";
import assessorController from "../controller/assessorController.js";
import { uploadConfig } from "../middleware/uploadImage.js";
import auth from "../middleware/authMiddleware.js";
import { resizeImages } from "../middleware/uploadImage.js"; // Ensure you import the resizeImages middleware
import { uploadDocument } from "../middleware/uploadDocument.js";

const router = Router();

router.get("/signin", auth.forwardAuth, assessorController.getSignIn);
router.post("/signin", auth.forwardAuth, assessorController.postSignIn);
router.post("/check-username", assessorController.checkUsername);
router.post("/check-email", assessorController.checkEmail);
router.post("/check-phonenumber", assessorController.checkPhonenumber);
router.get(
	"/home",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	assessorController.getHome
);

router.get(
	"/evaluate/:id",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	assessorController.getEvaluationId
);

router.post(
	"/evaluation",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	uploadDocument.none(),
	assessorController.postEvaluation
);
router.post(
	"/evaluation/update",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	uploadDocument.none(),
	assessorController.updateEvaluation
);

router.get(
	"/profile",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	assessorController.getProfile
);

router.post(
	"/profile",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	assessorController.postProfile
);

router.post(
	"/profile/change-password",
	auth.requireAuth,
	auth.checkRole(["assessor"]),
	assessorController.postChangePass
);


export default router;
