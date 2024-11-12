import { Router } from "express";
import adminController from "../controller/adminController.js";
import { uploadConfig } from "../middleware/uploadImage.js";
import auth from "../middleware/authMiddleware.js";
import { resizeImages } from "../middleware/uploadImage.js"; // Ensure you import the resizeImages middleware
import { uploadDocument } from "../middleware/uploadDocument.js";

const router = Router();

router.get("/signin", auth.forwardAuth, adminController.getSignIn);
router.post("/signin", auth.forwardAuth, adminController.postSignIn);

router.post(
	"/check-username",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.checkUsername
);
router.post(
	"/check-email",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.checkEmail
);
router.post(
	"/check-phonenumber",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.checkPhonenumber
);

router.get(
	"/dashboard",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getDashboard
);

router.get(
	"/applications/review",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getApplicationReview
);

router.get(
	"/applications/review/:document_id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getApplicationReviewId
);

router.post(
	"/applications/review",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postApplicationReviewId
);

router.get(
	"/interview",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getInterview
);

router.post(
	"/interview",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postInterview
);
router.post("/interview/edit/:interview_id", adminController.editInterview);

router.delete(
	"/interview/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteInterview
);
router.post(
	"/mark-as-complete/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.markAsComplete
);
router.post(
	"/send-email-notification",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.sendEmailNotification
);

router.post(
	"/cancel-interview/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.cancelInterview
);

router.post(
	"/accept-interview/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.acceptInterview
);
router.post(
	"/reject-interview/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.rejectInterview
);
router.post(
	"/evaluation/add-assessor",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postAddAssessor
);

router.get(
	"/evaluation",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getEvaluation
);
router.post(
	"/evaluation",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postEvaluation
);
router.post(
	"/evaluation/update",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.updateEvaluation
);
router.get(
	"/users",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUsers
);

router.get(
	"/user/:uuid/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUserEditId
);

router.post(
	"/user/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	adminController.postUserEditId
);

router.post(
	"/user/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteUser
);

router.get(
	"/evaluate/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getEvaluationId
);

router.get(
	"/institute",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getInstitute
);
router.get(
	"/institute/:id/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getInstituteEdit
);

router.post(
	"/institute",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postInstitute
);

router.post(
	"/institute/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postEditInstitute
);
router.post(
	"/institute/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteInstitute
);
router.post(
	"/availability",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.checkAvailability
);
router.get(
	"/assessor",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getAssessor
);
router.get(
	"/assessor/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getAssessorView
);
router.post(
	"/assessor",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postAssessor
);
router.post(
	"/assessor/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postAssessorEdit
);

router.post(
	"/assessor/remove",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.removeAssessor
);

router.post(
	"/assessor/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.deleteAssessor
);

router.post(
	"/award/points/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postAwardPoints
);

router.post(
	"/emp/points/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postEmpPoints
);

router.post(
	"/training/points/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postTrainingPoints
);

router.post(
	"/development/points/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postDevelopmentPoints
);

router.post(
	"/application/points/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadDocument.none(),
	adminController.postApplicationPoints
);

export default router;
