import { Router } from "express";
import userController from "../controller/userController.js";
import { uploadConfig } from "../middleware/uploadImage.js";
import auth from "../middleware/authMiddleware.js";
import { resizeImages } from "../middleware/uploadImage.js"; // Ensure you import the resizeImages middleware
import { uploadDocument } from "../middleware/uploadDocument.js";

const router = Router();

router.get("/signin", auth.forwardAuth, userController.getSignIn);
router.post("/signin", auth.forwardAuth, userController.postSignIn);

router.get("/signup", auth.forwardAuth, userController.getSignUp);
router.post(
	"/signup/",
	auth.forwardAuth,
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	userController.postSignUp
);
router.get(
	"/verify-email/:token",
	auth.forwardAuth,
	userController.getVerifyEmail
);
router.get("/request-reset", auth.forwardAuth, userController.getReqPass);
router.post("/request-reset", auth.forwardAuth, uploadDocument.none(), userController.postReqPass);

router.get(
	"/reset-password/:token",
	auth.forwardAuth,
	userController.getResetPass
);
router.post("/reset-password/", auth.forwardAuth,  uploadDocument.none(),  userController.postResetPass);

router.post("/check-username", userController.checkUsername);
router.post("/check-email", userController.checkEmail);
router.post("/check-phonenumber", userController.checkPhonenumber);
router.get(
	"/home",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getHome
);

router.get(
	"/application",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getApplications
);

router.get(
	"/application/:id/view",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getSubmitApplicationView
);
router.post(
	"/application/upload",
	auth.requireAuth,
	auth.checkRole(["user"]),
	uploadDocument.any(),
	userController.postApplicationDocument
);

router.get(
	"/submit-application",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getSubmitApplication
);
router.post(
	"/delete-document/:id",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.deleteDocumentUpload
);

router.post(
	"/submit-application",
	auth.requireAuth,
	auth.checkRole(["user"]),
	uploadDocument.any(),
	userController.postApplicationForm
);





router.get(
	"/interview",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getInterview
);
router.post(
	"/interview",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.postInterview
);

router.post('/accept-interview/:id', auth.requireAuth, auth.checkRole(['user']), userController.acceptInterview);
router.post('/reject-interview/:id', auth.requireAuth, auth.checkRole(['user']), userController.rejectInterview);
router.post(
	"/reschedule-interview/:id",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.rescheduleInterview
);






router.get(
	"/profile",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getProfile
);

router.post(
	"/profile",
	auth.requireAuth,
	auth.checkRole(["user"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	userController.postProfile
);

router.post(
	"/profile/change-password",
	auth.requireAuth,
	auth.checkRole(["user"]),

	userController.postChangePass
);

export default router;
