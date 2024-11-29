import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt from "bcrypt";
import createToken from "../utils/token.js";
import { nanoid } from "nanoid";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { get } from "http";
import { count } from "console";

const sendNotifications = async (userIds, message) => {
	// Implement your notification logic here
	for (const userId of userIds) {
		try {
			// Example: Send notification to each user
			// This could be an email, a push notification, or a database record
			await query(
				"INSERT INTO notifications (user_uuid, message) VALUES (?, ?)",
				[userId, message]
			);
			// Add any additional logic after successful notification
		} catch (error) {
			console.error(
				`Failed to send notification to user ${userId}:`,
				error
			);
			// Optionally handle the error (e.g., retry logic, logging, etc.)
		}
	}
};
const checkUsername = async (req, res) => {
	const { username, uuid } = req.body;

	let queryStr;
	let queryParams;

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = "SELECT * FROM assessor WHERE username = ? AND uuid != ?";
		queryParams = [username, uuid];
	} else {
		queryStr = "SELECT * FROM assessor WHERE username = ?";
		queryParams = [username];
	}

	try {
		const result = await query(queryStr, queryParams);

		if (result.length > 0) {
			return res.json({ available: false });
		} else {
			return res.json({ available: true });
		}
	} catch (err) {
		console.error("Database query failed:", err);
		return res
			.status(500)
			.json({ success: false, message: "Database error" });
	}
};

const checkEmail = async (req, res) => {
	const { email, uuid } = req.body;

	let queryStr;
	let queryParams;

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = "SELECT * FROM assessor WHERE email = ? AND uuid != ?";
		queryParams = [email, uuid];
	} else {
		queryStr = "SELECT * FROM assessor WHERE email = ?";
		queryParams = [email];
	}

	try {
		const result = await query(queryStr, queryParams);

		if (result.length > 0) {
			return res.json({ available: false });
		} else {
			return res.json({ available: true });
		}
	} catch (err) {
		console.error("Database query failed:", err);
		return res
			.status(500)
			.json({ success: false, message: "Database error" });
	}
};

const checkPhonenumber = async (req, res) => {
	const { phonenumber, uuid } = req.body;

	let queryStr;
	let queryParams;

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = "SELECT * FROM assessor WHERE phonenumber = ? AND uuid != ?";
		queryParams = [phonenumber, uuid];
	} else {
		queryStr = "SELECT * FROM assessor WHERE phonenumber = ?";
		queryParams = [phonenumber];
	}

	try {
		const result = await query(queryStr, queryParams);

		if (result.length > 0) {
			return res.json({ available: false });
		} else {
			return res.json({ available: true });
		}
	} catch (err) {
		console.error("Database query failed:", err);
		return res
			.status(500)
			.json({ success: false, message: "Database error" });
	}
};
const getSignIn = (req, res) => {
	res.render("Assessor/signin", {
		title: "Sign In as Assessor",
		username: req.flash("username")[0],
	});
};
const postSignIn = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * FROM assessor WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/assessor/signin");
			} else {
				if (result.length > 0) {
					const user = result[0];

					const match_password = await bcrypt.compare(
						password,
						user.password
					);
					if (match_password) {
						const generateToken = createToken(
							user.uuid,
							user.username,
							"assessor"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/assessor/home");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/assessor/signin");
					}
				} else {
					req.flash("error_msg", "Couldn't find your account");
					res.redirect("/assessor/signin");
				}
			}
		});
	} catch (err) {
		console.error(err); // Log the error for debugging
		req.flash("error_msg", "An error occurred during authentication.");
		res.redirect("/assessor/signin");
	}
};

const getHome = async (req, res) => {
	const applications = await query(
		"SELECT a.id,a.name,aa.status,aa.assessor_id FROM application_assessors aa LEFT JOIN application a ON a.id = aa.application_id WHERE aa.assessor_id = ?;",
		[res.locals.user.id]
	);

	res.render("Assessor/evaluation", {
		title: "For Evaluation",
		page: "evaluation",
		pagetitle: "For Evaluation",
		applications,
	});
};

const getEvaluationId = async (req, res) => {
	const { id } = req.params;
	const hasAccess = await query(
		"SELECT * FROM application_assessors WHERE application_id = ? AND assessor_id = ?",
		[id, res.locals.user.id]
	)
	if (hasAccess.length === 0) {
		res.redirect("/assessor/home");
		return;
	}
	const usersEvaluation = await query(
		"SELECT * FROM evaluations WHERE assessor_id = ? AND application_id = ?",
		[res.locals.user.id, id]
	);

	const usersEvaluationHistory = await query(
		"SELECT * FROM evaluation_history WHERE assessor_id = ? AND application_id = ? ORDER BY created_at DESC",
		[res.locals.user.id, id]
	);

	// Assuming usersEvaluationHistory is an array with one or more evaluation records
	usersEvaluationHistory.forEach((evaluation) => {
		evaluation.work_experience_points = evaluation.work_experience_points
			.split(",")
			.map((point) => point.trim());
		evaluation.training_points = evaluation.training_points
			.split(",")
			.map((point) => point.trim());
		evaluation.professional_development_points =
			evaluation.professional_development_points
				.split(",")
				.map((point) => point.trim());
		evaluation.award_points = evaluation.award_points
			.split(",")
			.map((point) => point.trim());
		evaluation.eligibility_points = evaluation.eligibility_points
			.split(",")
			.map((point) => point.trim());
	});

	const application = (
		await query("SELECT * FROM application WHERE id = ?", [id])
	)[0];

	const workExperience = await query(
		"SELECT * FROM work_experience WHERE application_id = ? ORDER BY id DESC",
		[id]
	);
	const trainingExperience = await query(
		"SELECT * FROM training WHERE application_id = ? ORDER BY id DESC",
		[id]
	);
	const professionalDevelopments = await query(
		"SELECT * FROM professional_development WHERE application_id = ? ORDER BY id DESC",
		[id]
	);
	const awards = await query(
		"SELECT * FROM award WHERE application_id = ? ORDER BY id DESC",
		[id]
	);
	res.render("Assessor/evaluation_view", {
		title: "Evaluate Applicant",
		page: "evaluation",
		pagetitle: "Evaluate Applicant",
		usersEvaluation,
		application,
		workExperience,
		trainingExperience,
		professionalDevelopments,
		usersEvaluationHistory,
		awards,
	});
};

const postEvaluation = async (req, res) => {
	const user_id = res.locals.user.id;

	const {
		application_id,
		education_points,
		work_experience_points,
		training_points,
		professional_dev_points,
		award_points,
		csc_points,
		nc_points,
		prc_points,
		interview_chief_points,
		interview_assessor_points,
	} = req.body;

	// Sum the points in the arrays
	const work_experience_total = work_experience_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const training_total = training_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const professional_dev_total = professional_dev_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const award_total = award_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);

	// Create comma-separated strings for point history
	const work_experience_history = work_experience_points.join(", ");
	const training_history = training_points.join(", ");
	const professional_dev_history = professional_dev_points.join(", ");
	const award_history = award_points.join(", ");

	// Calculate total points
	const points_calculated =
		parseInt(education_points) +
		work_experience_total +
		training_total +
		professional_dev_total +
		award_total +
		parseInt(csc_points) +
		parseInt(nc_points) +
		parseInt(prc_points) +
		parseInt(interview_chief_points) +
		parseInt(interview_assessor_points);

	// Check qualification status
	let qualification_status;
	if (points_calculated >= 45) {
		qualification_status = "Qualified";
	} else {
		qualification_status = "Not Qualified";
	}

	// Validate input data
	if (
		education_points < 0 ||
		work_experience_points.some((point) => point < 0) ||
		training_points.some((point) => point < 0) ||
		professional_dev_points.some((point) => point < 0) ||
		award_points.some((point) => point < 0) ||
		csc_points < 0 ||
		nc_points < 0 ||
		prc_points < 0 ||
		interview_chief_points < 0 ||
		interview_assessor_points < 0
	) {
		return res.status(400).json({
			success: false,
			message: "Points must be non-negative.",
		});
	}

	try {
		// SQL query to check if an evaluation already exists
		const checkSql =
			"SELECT * FROM evaluations WHERE assessor_id = ? AND application_id = ?";
		const checkValues = [user_id, application_id];

		// Execute query to check if record exists
		const existingEvaluation = await query(checkSql, checkValues);

		if (existingEvaluation.length > 0) {
			// If evaluation already exists, return an error message or handle it as needed
			return res.status(400).json({
				success: false,
				message:
					"Evaluation already exists for this user and application.",
			});
		}

		const eligibility_points =
			parseInt(csc_points) + parseInt(nc_points) + parseInt(prc_points);
		const eligibility_points_history = 	`${csc_points}, ${nc_points}, ${prc_points}`
		
		// SQL query to insert a new evaluation if no record exists
		const insertSql =
			"INSERT INTO evaluations (" +
			"assessor_id, " +
			"application_id, " +
			"educational_points, " +
			"work_experience_points, " +
			"training_points, " +
			"professional_development_points, " +
			"award_points, " +
			"eligibility_points, " +
			"interview_chief_points, " +
			"interview_assessor_points, " +
			"status" +
			") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		const values = [
			user_id,
			application_id,
			education_points,
			work_experience_total,
			training_total,
			professional_dev_total,
			award_total,
			eligibility_points,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
		];

		// Insert into evaluations table
		await query(insertSql, values);

		// Insert evaluation history into evaluation_history table
		const historyInsertSql =
			"INSERT INTO evaluation_history (" +
			"assessor_id, " +
			"application_id, " +
			"education_points, " +
			"work_experience_points, " +
			"training_points, " +
			"professional_development_points, " +
			"award_points, " +
			"eligibility_points, " +
			"interview_chief_points, " +
			"interview_assessor_points, " +
			"status" +
			") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		const historyValues = [
			user_id,
			application_id,
			education_points,
			work_experience_history,
			training_history,
			professional_dev_history,
			award_history,
			eligibility_points_history,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
		];

		// Insert into evaluation history table
		await query(historyInsertSql, historyValues);

		// Update application_assessors table to 'Evaluated' status
		await query(
			"UPDATE application_assessors SET status = 'Evaluated' WHERE application_id = ? AND assessor_id = ?",
			[application_id, user_id]
		);

		// Return success response
		res.status(201).json({
			success: true,
			message: "Evaluation and evaluation history created successfully",
		});
	} catch (error) {
		console.error("Error inserting evaluation:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
};

const updateEvaluation = async (req, res) => {
	const user_id = res.locals.user.id;
	
	const {
		application_id,
		education_points,
		work_experience_points,
		training_points,
		professional_dev_points,
		award_points,
		csc_points,
		nc_points,
		prc_points,
		interview_chief_points,
		interview_assessor_points,
	} = req.body;

	// Sum the points in the arrays
	const work_experience_total = work_experience_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const training_total = training_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const professional_dev_total = professional_dev_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);
	const award_total = award_points.reduce(
		(acc, val) => acc + parseInt(val),
		0
	);

	// Create comma-separated strings for point history
	const work_experience_history = work_experience_points.join(", ");
	const training_history = training_points.join(", ");
	const professional_dev_history = professional_dev_points.join(", ");
	const award_history = award_points.join(", ");

	// Calculate total points
	const points_calculated =
		parseInt(education_points) +
		work_experience_total +
		training_total +
		professional_dev_total +
		award_total +
		parseInt(csc_points) +
		parseInt(nc_points) +
		parseInt(prc_points) +
		parseInt(interview_chief_points) +
		parseInt(interview_assessor_points);

	// Check qualification status
	let qualification_status;
	if (points_calculated >= 45) {
		qualification_status = "Qualified";
	} else {
		qualification_status = "Not Qualified";
	}

	// Validate input data
	if (
		education_points < 0 ||
		work_experience_points.some((point) => point < 0) ||
		training_points.some((point) => point < 0) ||
		professional_dev_points.some((point) => point < 0) ||
		award_points.some((point) => point < 0) ||
		csc_points < 0 ||
		nc_points < 0 ||
		prc_points < 0 ||
		interview_chief_points < 0 ||
		interview_assessor_points < 0
	) {
		return res.status(400).json({
			success: false,
			message: "Points must be non-negative.",
		});
	}

	try {
		// SQL query to check if an evaluation exists
		const checkSql =
			"SELECT * FROM evaluations WHERE assessor_id = ? AND application_id = ?";
		const checkValues = [user_id, application_id];

		// Execute query to check if record exists
		const existingEvaluation = await query(checkSql, checkValues);

		if (existingEvaluation.length === 0) {
			// If no evaluation exists, return an error message
			return res.status(404).json({
				success: false,
				message:
					"No existing evaluation found for this user and application.",
			});
		}

		const eligibility_points =
			parseInt(csc_points) + parseInt(nc_points) + parseInt(prc_points);
		const eligibility_points_history = 	`${csc_points}, ${nc_points}, ${prc_points}`
		// SQL query to update the existing evaluation
		const updateSql =
			"UPDATE evaluations SET " +
			"educational_points = ?, " +
			"work_experience_points = ?, " +
			"training_points = ?, " +
			"professional_development_points = ?, " +
			"award_points = ?, " +
			"eligibility_points = ?, " +
			"interview_chief_points = ?, " +
			"interview_assessor_points = ?, " +
			"status = ? " +
			"WHERE assessor_id = ? AND application_id = ?";

		const values = [
			education_points,
			work_experience_total,
			training_total,
			professional_dev_total,
			award_total,
			eligibility_points,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
			user_id,
			application_id,
		];

		// Execute SQL query to update the evaluation
		await query(updateSql, values);

		// Insert evaluation history into evaluation_history table
		const historyInsertSql =
			"INSERT INTO evaluation_history (" +
			"assessor_id, " +
			"application_id, " +
			"education_points, " +
			"work_experience_points, " +
			"training_points, " +
			"professional_development_points, " +
			"award_points, " +
			"eligibility_points, " +
			"interview_chief_points, " +
			"interview_assessor_points, " +
			"status" +
			") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		const historyValues = [
			user_id,
			application_id,
			education_points,
			work_experience_history,
			training_history,
			professional_dev_history,
			award_history,
			eligibility_points_history,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
		];

		// Insert into evaluation history table
		await query(historyInsertSql, historyValues);

		// Update application_assessors table to 'Evaluated' status
		await query(
			"UPDATE application_assessors SET status = 'Evaluated' WHERE application_id = ? AND assessor_id = ?",
			[application_id, user_id]
		);

		// Return success response
		res.status(200).json({
			success: true,
			message: "Evaluation updated successfully",
		});
	} catch (error) {
		console.error("Error updating evaluation:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
};

const getProfile = async (req, res) => {
	const uuid = res.locals.user.id;
	const profile = (
		await query("SELECT * FROM assessor WHERE uuid = ?", [uuid])
	)[0];

	res.render("Assessor/profile", {
		title: "Profile",
		page: "profile",
		pagetitle: "Your Profile",
		profile,
	});
};

const postProfile = async (req, res) => {
	const profile =
		req.files && req.files.profile ? req.files.profile[0].filename : null;

	// Data from the form
	const id = res.locals.user.id;
	const {
		firstname,
		lastname,
		middlename,

		phonenumber,
		email,
		birthday,
		gender,
	} = req.body;

	let errors = [];

	// Check if the phone number or email has been taken by another user
	const phone_exist =
		"SELECT COUNT(*) as `count` FROM assessor WHERE phonenumber = ? AND uuid != ?";
	const email_exist =
		"SELECT COUNT(*) as `count` FROM assessor WHERE email = ? AND uuid != ?";

	const phone_count = (await query(phone_exist, [phonenumber, id]))[0].count;
	const email_count = (await query(email_exist, [email, id]))[0].count;

	if (phone_count > 0) {
		errors.push({
			msg: "Phonenumber is already registered to another user",
		});
	}
	if (email_count > 0) {
		errors.push({ msg: "Email is already registered to another user" });
	}

	if (errors.length > 0) {
		return res.json({ success: false, errors });
	} else {
		// Data to update in SQL
		const data = {
			firstname,
			lastname,
			middlename,

			phonenumber,
			email,
			birthday,
			gender,
		};

		if (profile) {
			data.profile_url = profile;
		}

		// Update account in the database
		const sql =
			"UPDATE assessor SET ? , modified_at = CURRENT_TIMESTAMP WHERE uuid = ?";

		db.query(sql, [data, id], (err) => {
			if (err) {
				return res.json({
					success: false,
					error: "Failed to update user details.",
				});
			} else {
				return res.json({ success: true });
			}
		});
	}
};

const postChangePass = async (req, res) => {
	const { current_password, new_password } = req.body;
	const userId = res.locals.user.id;

	try {
		const user = (
			await query("SELECT * FROM assessor WHERE uuid = ?", [userId])
		)[0];

		const match = await bcrypt.compare(current_password, user.password);
		if (!match) {
			return res.status(400).json({
				success: false,
				errors: [
					{
						field: "current_password",
						msg: "Old password is incorrect",
					},
				],
			});
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(new_password, saltRounds);

		await query("UPDATE assessor SET password = ? WHERE uuid = ?", [
			hashedPassword,
			userId,
		]);

		return res.json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Failed to change password" });
	}
};

export default {
	getSignIn,
	postSignIn,
	getHome,
	getProfile,
	postProfile,
	postChangePass,
	getEvaluationId,
	postEvaluation,
	updateEvaluation,checkUsername,checkEmail,checkPhonenumber
};
