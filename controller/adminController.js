import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt, { compareSync } from "bcrypt";
import { nanoid } from "nanoid";
import createToken from "../utils/token.js";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { application } from "express";

import PDFDocument from "pdfkit";
import fs from "fs";
const getSignIn = (req, res) => {
	res.render("Admin/signin", {
		title: "Admin Sign In",
		username: req.flash("username")[0],
	});
};

const postSignIn = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * from admin WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/admin/signin");
			} else {
				if (result.length > 0) {
					const match_password = await bcrypt.compare(
						password,
						result[0].password
					);
					if (match_password) {
						const generateToken = createToken(
							result[0].id,
							result[0].username,

							"admin"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/admin/dashboard");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/admin/signin");
					}
				} else {
					req.flash("error_msg", "Could'nt find your account");
					res.redirect("/admin/signin");
				}
			}
		});
	} catch {
		throw err;
	}
};

const checkUsername = async (req, res) => {
	const { username, uuid, user } = req.body;

	let queryStr;
	let queryParams;
	const table = user === "faculty" ? "faculty" : "users";

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = `SELECT * FROM ${table} WHERE username = ? AND uuid != ?`;
		queryParams = [username, uuid];
	} else {
		queryStr = `SELECT * FROM ${table} WHERE username = ?`;
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
	const { email, uuid, user } = req.body;

	let queryStr;
	let queryParams;
	const table = user === "faculty" ? "faculty" : "users";

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = `SELECT * FROM ${table} WHERE email = ? AND uuid != ?`;
		queryParams = [email, uuid];
	} else {
		queryStr = `SELECT * FROM ${table} WHERE email = ?`;
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
	const { phonenumber, uuid, user } = req.body;

	let queryStr;
	let queryParams;
	const table = user === "faculty" ? "faculty" : "users";

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = `SELECT * FROM ${table} WHERE phonenumber = ? AND uuid != ?`;
		queryParams = [phonenumber, uuid];
	} else {
		queryStr = `SELECT * FROM ${table} WHERE phonenumber = ?`;
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

const getDashboard = async (req, res) => {
	try {
		// Count total applications
		const total_applications = (
			await query(
				"SELECT COUNT(*) AS total_applications FROM application;"
			)
		)[0].total_applications;

		// Count total evaluations
		const total_evaluations = (
			await query(
				"SELECT COUNT(*) AS total_evaluations FROM evaluations;"
			)
		)[0].total_evaluations;

		// Count total assessors
		const total_assessors = (
			await query("SELECT COUNT(*) AS total_assessors FROM assessor;")
		)[0].total_assessors;
		const total_users = (
			await query("SELECT COUNT(*) AS total_users FROM users;")
		)[0].total_users;
		// Count pending applications
		const pending_applications = (
			await query(
				"SELECT COUNT(*) AS pending_applications FROM application WHERE status = 'Pending';"
			)
		)[0].pending_applications;

		// Count qualified evaluations
		const qualified_evaluations = (
			await query(
				"SELECT COUNT(*) AS qualified_evaluations FROM evaluations WHERE status = 'Qualified';"
			)
		)[0].qualified_evaluations;

		// Get recent applications
		const recentApplications = await query(
			"SELECT * FROM application ORDER BY created_at DESC LIMIT 5;"
		);

		// Get assessor details with evaluations
		const assessors = await query(`
           SELECT ass.assessor_id, ass.firstname, ass.lastname, ass.email, e.total_score, e.status AS evaluation_status, a.name FROM assessor ass LEFT JOIN application_assessors aa ON ass.uuid = aa.assessor_id LEFT JOIN application a ON a.id = aa.application_id LEFT JOIN evaluations e ON ass.uuid = e.assessor_id;;
        `);

		// Render the dashboard with all retrieved data
		res.render("Admin/dashboard", {
			title: "Admin Dashboard",
			page: "dashboard",
			pagetitle: "Admin Dashboard",
			total_applications,
			total_evaluations,
			total_assessors,
			pending_applications,
			qualified_evaluations,
			recentApplications,
			total_users,

			assessors,
		});
	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		res.status(500).send("Server Error");
	}
};

const getApplicationReview = async (req, res) => {
	const applications = await query(
		"SELECT * FROM application WHERE status IN (?, ?, ?, ?)",
		[
			"Pending",
			"Under Review",
			"Additional Information Requested",
			"Approved",
		]
	);

	// Render the page with updated project data
	res.render("Admin/applications_review", {
		title: "Application For Review",
		page: "application_form",
		pagetitle: "Application For Review",
		applications,
	});
};

const getApplicationReviewId = async (req, res) => {
	const { document_id } = req.params;

	const application = (
		await query("SELECT * FROM application WHERE id = ?", [document_id])
	)[0];
	const comments = await query(
		"SELECT * FROM comments WHERE application_id = ? ORDER BY id DESC",
		[document_id]
	);
	const workExperience = await query(
		"SELECT * FROM work_experience WHERE application_id = ? ORDER BY id DESC",
		[document_id]
	);
	const trainingExperience = await query(
		"SELECT * FROM training WHERE application_id = ? ORDER BY id DESC",
		[document_id]
	);
	const professionalDevelopments = await query(
		"SELECT * FROM professional_development WHERE application_id = ? ORDER BY id DESC",
		[document_id]
	);
	const awards = await query(
		"SELECT * FROM award WHERE application_id = ? ORDER BY id DESC",
		[document_id]
	);
	// Render the page with updated project data
	res.render("Admin/application_review_document", {
		title: "Application Document Review",
		page: "application_form",
		pagetitle: "Application Document Review",
		application,
		comments,
		workExperience,
		trainingExperience,
		professionalDevelopments,
		awards,
	});
};
const postAwardPoints = async (req, res) => {
	const { awardId, points } = req.body; // Extract awardId and points from the request body

	try {
		// Update points for the award
		const query_update_points = await query(
			`UPDATE award SET points = ? WHERE id = ?`,
			[points, awardId]
		);

		return res.json({
			success: true,
			message: "Award points updated successfully.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update points",
		});
	}
};
const postEmpPoints = async (req, res) => {
	const { empId, points } = req.body; // Extract awardId and points from the request body

	try {
		// Update points for the award
		const query_update_points = await query(
			`UPDATE work_experience SET points = ? WHERE id = ?`,
			[points, empId]
		);

		return res.json({
			success: true,
			message: "Work Experience points updated successfully.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update points",
		});
	}
};

const postTrainingPoints = async (req, res) => {
	const { trainingId, points } = req.body; // Extract awardId and points from the request body

	try {
		// Update points for the award
		const query_update_points = await query(
			`UPDATE training SET points = ? WHERE id = ?`,
			[points, trainingId]
		);

		return res.json({
			success: true,
			message: "Training points updated successfully.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update points",
		});
	}
};
const postDevelopmentPoints = async (req, res) => {
	const { devId, points } = req.body; // Extract awardId and points from the request body

	try {
		// Update points for the award
		const query_update_points = await query(
			`UPDATE professional_development SET points = ? WHERE id = ?`,
			[points, devId]
		);

		return res.json({
			success: true,
			message: "Professional Development points updated successfully.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update points",
		});
	}
};

const postApplicationPoints = async (req, res) => {
	const { applicationId, pointsType, points } = req.body; // Extract awardId and points from the request body

	try {
		if (pointsType === "Education") {
			// Update points for the award
			const query_update_points = await query(
				`UPDATE application SET education_points = ? WHERE id = ?`,
				[points, applicationId]
			);
		}

		if (pointsType === "CSC") {
			// Update points for the award
			const query_update_points = await query(
				`UPDATE application SET csc_points = ? WHERE id = ?`,
				[points, applicationId]
			);
		}
		if (pointsType === "NC") {
			// Update points for the award
			const query_update_points = await query(
				`UPDATE application SET nc_points = ? WHERE id = ?`,
				[points, applicationId]
			);
		}

		if (pointsType === "PRC") {
			// Update points for the award
			const query_update_points = await query(
				`UPDATE application SET prc_points = ? WHERE id = ?`,
				[points, applicationId]
			);
		}

		return res.json({
			success: true,
			message: `${pointsType} Points updated successfully.`,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update points",
		});
	}
};

const postApplicationReviewId = async (req, res) => {
	const { id, status, comment } = req.body; // Extract comment from request body
	try {
		// Update application status
		const query_documents = await query(
			`UPDATE application SET status = ? WHERE id = ?`,
			[status, id]
		);

		// Insert comment into comments table
		const query_comments = await query(
			`INSERT INTO comments (application_id, author, text) VALUES (?, ?, ?)`,
			[
				id,
				"Admin",
				`${status}: ${comment === "" ? "No comment" : comment}`,
			] // Replace 'Admin' with appropriate author if needed
		);

		return res.json({
			success: true,
			message:
				"Application status updated successfully, and comment added.",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update application status and add comment",
		});
	}
};

const getInterview = async (req, res) => {
	try {
		// Fetch interview data from the database
		const users = await query(
			`SELECT i.id, i.interview_date, i.application_id, i.interview_time, i.interview_type, i.status, u.email, u.profile_url, u.phonenumber, u.firstname, u.middlename, u.lastname, u.uuid
            FROM interviews i
            JOIN users u ON i.user_id = u.uuid
            GROUP BY i.id;`
		);

		const approved_users = await query(
			"SELECT users.*, application.status FROM users left join application on application.uuid = users.uuid"
		);

		const approved_application = await query(
			"SELECT name,uuid,id FROM application WHERE status = 'Approved'"
		);

		// Render the interview page with the fetched data
		res.render("Admin/interviews", {
			title: "Interviews",
			page: "interviews",
			pagetitle: "All Scheduled Interviews",
			users,
			approved_users,
			approved_application,
		});
	} catch (error) {
		console.error("Error fetching interviews:", error);
		res.status(500).send("Server error while fetching interviews.");
	}
};
const postInterview = async (req, res) => {
	const { application_id, interview_date, interview_time, interview_type } = req.body;
	try {
		const user_id = (
			await query("SELECT uuid FROM application WHERE id = ?", [
				application_id,
			])
		)[0].uuid;

		// Check for existing pending interviews on the same date for the same user
		const existingInterviews = await query(
			`SELECT COUNT(*) as count FROM interviews 
             WHERE user_id = ? AND status = 'Pending' AND status = 'Accepted' AND status = 'Rescheduled' `,
			[user_id]
		);

		// If there are existing pending interviews, send an error response
		if (existingInterviews[0].count > 0) {
			return res.status(400).json({
				success: false,
				message: "There is already a pending interview on this user.",
			});
		}
		const query_documents = await query(
			`INSERT INTO interviews (application_id,user_id, interview_date, interview_time, interview_type) VALUES (?, ?, ?, ?, ?)`,
			[application_id, user_id, interview_date, interview_time, interview_type]
		);

		return res.json({
			success: true,
			message: "Interview scheduled successfully",
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to schedule interview" });
	}
};

const acceptInterview = async (req, res) => {
	const { id } = req.params; // Get interview ID from the route parameters

	try {
		// Update the interview status to 'Accepted'
		const result = await query(
			"UPDATE interviews SET status = ? WHERE id = ?",
			["Accepted", id]
		);

		// Check if the update was successful
		if (result.affectedRows === 1) {
			res.status(200).json({
				success: true,
				message: "Interview accepted successfully.",
			});
		} else {
			res.status(404).json({
				success: false,
				message: "Interview not found or already processed.",
			});
		}
	} catch (error) {
		console.error("Error accepting interview:", error);
		res.status(500).json({
			success: false,
			message: "An error occurred while accepting the interview.",
		});
	}
};
const rescheduleInterview = async (req, res) => {
    const { id } = req.params; // Get interview ID from the route parameters
    const { interview_date, interview_time, email, firstname, interview_type } = req.body;
	
    try {
        // Update the interview date and time
        const result = await query(
            "UPDATE interviews SET interview_date = ?, interview_time = ?, status = 'Pending', interview_type = ? WHERE id = ?",
            [interview_date, interview_time, interview_type, id]
        );

        // Check if the update was successful
        if (result.affectedRows === 1) {
            // Set up the transporter for sending emails
            const transporter = nodemailer.createTransport({
				host: process.env.EMAIL_HOST,
				port: process.env.EMAIL_PORT,
				secure: process.env.EMAIL_SECURE,
                auth: {
                    user: process.env.EMAIL, // Use environment variables for sender's email credentials
                    pass: process.env.PASS,
                },
            });

            // Define the email content for rescheduling notification
            const mailOptions = {
                to: email,
                from: "no-reply@yourorganization.com", // Change to your sending email
                subject: "Interview Rescheduled - MMSU ETEEAP",
                html: `<p>Dear ${firstname},</p>
                       <p>Your interview with <strong>MMSU ETEEAP</strong> has been rescheduled.</p>
                       <p><strong>New Schedule:</strong><br>
                       	Date: ${interview_date}<br>
                       	Time: ${interview_time}<br>
						Type: ${interview_type}</p>
					 
                       <p>We apologize for any inconvenience this may have caused and appreciate your understanding.</p>
                       <p>If you have any questions or need further information, feel free to contact us.</p>
                       <p>Best regards,<br>The MMSU ETEEAP Team</p>`,
            };

            // Send the email notification
            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error("Error sending reschedule notification:", err);
                    return res.status(500).json({
                        success: true,
                        message:
                            "Interview rescheduled successfully, but failed to send notification email.",
                    });
                }

                // Success response
                res.status(200).json({
                    success: true,
                    message: "Interview rescheduled and notification sent successfully.",
                });
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Interview not found or already processed.",
            });
        }
    } catch (error) {
        console.error("Error rescheduling interview:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while rescheduling the interview.",
        });
    }
};


const rejectInterview = async (req, res) => {
	const { id } = req.params; // Get interview ID from the route parameters

	try {
		// Update the interview status to 'Rejected'
		const result = await query(
			"UPDATE interviews SET status = ? WHERE id = ?",
			["Rejected", id]
		);

		// Check if the update was successful
		if (result.affectedRows === 1) {
			res.status(200).json({
				success: true,
				message: "Interview rejected successfully.",
			});
		} else {
			res.status(404).json({
				success: false,
				message: "Interview not found or already processed.",
			});
		}
	} catch (error) {
		console.error("Error rejecting interview:", error);
		res.status(500).json({
			success: false,
			message: "An error occurred while rejecting the interview.",
		});
	}
};

const editInterview = async (req, res) => {
	const { interview_id } = req.params;
	const { interview_date, interview_time } = req.body;
	console.log(req.params);
	console.log(req.body);
	try {
		const query_result = await query(
			`UPDATE interviews SET interview_date = ?, interview_time = ? WHERE id = ?`,
			[interview_date, interview_time, interview_id]
		);

		if (query_result.affectedRows > 0) {
			return res.json({
				success: true,
				message: "Interview updated successfully",
			});
		} else {
			return res.status(404).json({
				success: false,
				message: "Interview not found",
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to update interview",
		});
	}
};

const deleteInterview = async (req, res) => {
	const { interview_id } = req.body;
	console.log(req.body);

	try {
		const query_result = await query(
			`DELETE FROM interviews WHERE id = ?`,
			[interview_id]
		);

		if (query_result.affectedRows > 0) {
			return res.json({
				success: true,
				message: "Interview deleted successfully",
			});
		} else {
			return res.status(404).json({
				success: false,
				message: "Interview not found",
			});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Failed to delete interview",
		});
	}
};

const sendEmailNotification = async (req, res) => {
	const { email, firstname } = req.body; // Get interview ID and user's first name from the request body

	try {
		// Set up the transporter for sending emails
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			secure: process.env.EMAIL_SECURE,
			auth: {
				user: process.env.EMAIL, // Use environment variables for sender's email credentials
				pass: process.env.PASS,
			},
		});

		// You can generate the interview details link if required

		// Define the email content for interview preparation
		const mailOptions = {
			to: email,
			from: "no-reply@yourorganization.com", // Change to your sending email
			subject: "Interview Preparation Reminder - MMSU ETEEAP",
			html: `<p>Dear ${firstname},</p>
				   <p>We hope you are doing well. This is a friendly reminder to prepare for your upcoming interview with <strong>MMSU ETEEAP</strong>.</p>
				   <p>Your interview is scheduled soon, and we recommend that you review any necessary documents and be ready to discuss your qualifications.</p>
				   <p>You can view your interview details and schedule in your application</p>
				
				   <p>If you have any questions or need further information, feel free to contact us.</p>
				   <p>Best regards,<br>The MMSU ETEEAP Team</p>`,
		};

		// Send the email
		transporter.sendMail(mailOptions, (err) => {
			if (err) {
				console.error(err);
				return res.json({
					success: false,
					msg: "Failed to send interview preparation email",
				});
			}

			// Success response
			return res.json({
				success: true,
				msg: "Notification sent successfully!",
			});
		});
	} catch (error) {
		console.error(
			"Error sending interview preparation notification:",
			error
		);
		res.status(500).json({
			success: false,
			message:
				"An error occurred while sending the interview preparation notification.",
		});
	}
};

const markAsComplete = async (req, res) => {
	const { id } = req.params; // Get interview ID from the route parameters

	try {
		// Update the interview status to 'Completed'
		const result = await query(
			"UPDATE interviews SET status = ? WHERE id = ?",
			["Completed", id]
		);

		// Check if the update was successful
		if (result.affectedRows === 1) {
			res.status(200).json({
				success: true,
				message: "Interview marked as complete successfully.",
			});
		} else {
			res.status(404).json({
				success: false,
				message: "Interview not found or already processed.",
			});
		}
	} catch (error) {
		console.error("Error marking interview as complete:", error);
		res.status(500).json({
			success: false,
			message:
				"An error occurred while marking the interview as complete.",
		});
	}
};

const cancelInterview = async (req, res) => {
	const { id } = req.params; // Get interview ID from the route parameters

	try {
		// Update the interview status to 'Cancelled'
		const result = await query(
			"UPDATE interviews SET status = ? WHERE id = ?",
			["Cancelled", id]
		);

		// Check if the update was successful
		if (result.affectedRows === 1) {
			res.status(200).json({
				success: true,
				message: "Interview cancelled successfully.",
			});
		} else {
			res.status(404).json({
				success: false,
				message: "Interview not found or already processed.",
			});
		}
	} catch (error) {
		console.error("Error cancelling interview:", error);
		res.status(500).json({
			success: false,
			message: "An error occurred while cancelling the interview.",
		});
	}
};

const getUsers = async (req, res) => {
	const users = await query(
		`SELECT u.email, u.profile_url, u.firstname, u.middlename, u.lastname, u.uuid, u.phonenumber, u.is_verified
		 FROM users u 
		 GROUP BY u.uuid;`
	);

	res.render("Admin/users", {
		title: "Users",
		page: "users",
		pagetitle: "All Registered Users",
		users,
	});
};

const getUserEditId = async (req, res) => {
	const uuid = req.params.uuid;

	const profile = (
		await query("SELECT * FROM users WHERE uuid = ?", [uuid])
	)[0];

	res.render("Admin/users_edit", {
		title: "Edit User Account",
		page: "users",
		pagetitle: "Edit User Details",
		profile,
	});
};
const postUserEditId = async (req, res) => {
	// Get the uploaded profile picture if available
	const profile =
		req.files && req.files.profile ? req.files.profile[0].filename : null;

	// Data from the form
	const uuid = req.body.uuid;
	const {
		firstname,
		lastname,
		middlename,

		phonenumber,
		email,

		gender,

		password, // Optional password field
	} = req.body;

	let errors = [];

	// Check if the phone number or email has been taken by another faculty member
	const phone_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE phonenumber = ? AND uuid != ?";
	const email_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE email = ? AND uuid != ?";

	const phone_count = (await query(phone_exist, [phonenumber, uuid]))[0]
		.count;
	const email_count = (await query(email_exist, [email, uuid]))[0].count;

	// Add validation errors if phone or email is already taken
	if (phone_count > 0) {
		errors.push({
			msg: "Phonenumber is already registered to another student member",
		});
	}
	if (email_count > 0) {
		errors.push({
			msg: "Email is already registered to another student member",
		});
	}

	// If there are validation errors, return them in the response
	if (errors.length > 0) {
		return res.json({ success: false, errors });
	} else {
		// Data to update in the faculty table
		const data = {
			firstname,
			lastname,
			middlename,

			phonenumber,
			email,

			gender,
		};

		// If a new profile picture is uploaded, update the profile_url field
		if (profile) {
			data.profile_url = profile;
		}

		// If password is provided, hash it and add it to the data
		if (password && password.trim() !== "") {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			data.password = hashedPassword;
		}

		// Update the faculty member's details in the database
		const sql = "UPDATE users SET ? WHERE uuid = ?";
		try {
			await query(sql, [data, uuid]);
			return res.json({
				success: true,
				message: "Users details updated successfully.",
			});
		} catch (err) {
			console.error("Failed to update users details:", err);
			return res.json({
				success: false,
				error: "Failed to update users details.",
			});
		}
	}
};
const deleteUser = async (req, res) => {
	const { user_id } = req.body;
	console.log(req.body);
	try {
		const deleteQuery = "DELETE FROM users WHERE uuid = ?";
		await query(deleteQuery, [user_id]);
		return res.json({ success: true });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to delete user." });
	}
};
const getInstitute = async (req, res) => {
	const institutes = await query(
		`SELECT ins.id, ins.abbreviation, ins.institute_name, ins.dean FROM institute ins ;`
	);

	res.render("Admin/institute", {
		title: "Institute",
		page: "institute",
		pagetitle: "Institute",
		institutes,
	});
};

const postInstitute = async (req, res) => {
	const { abbreviation, institute_name, dean } = req.body;

	let errors = [];

	// Check if the institute name already exists
	const instituteExistQuery =
		"SELECT COUNT(*) as count FROM institute WHERE institute_name = ?";
	const instituteCount = (
		await query(instituteExistQuery, [institute_name])
	)[0].count;
	if (instituteCount > 0) {
		errors.push({
			field: "institute_name",
			msg: "Institute name already exists",
		});
	}

	// Check if the abbreviation already exists
	const abbreviationExistQuery =
		"SELECT COUNT(*) as count FROM institute WHERE abbreviation = ?";
	const abbreviationCount = (
		await query(abbreviationExistQuery, [abbreviation])
	)[0].count;
	if (abbreviationCount > 0) {
		errors.push({
			field: "abbreviation",
			msg: "Abbreviation already exists",
		});
	}

	if (errors.length > 0) {
		return res.status(400).json({ success: false, errors });
	}

	try {
		const instituteData = {
			abbreviation,
			institute_name,
			dean,
		};

		const instituteSql = "INSERT INTO institute SET ?";
		const result = await query(instituteSql, instituteData);

		return res.json({ success: true, institute_id: result.insertId });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to add institute" });
	}
};

const getInstituteEdit = async (req, res) => {
	const ins_id = req.params.id;

	try {
		const institutes = await query(
			`SELECT ins.id, ins.abbreviation, ins.institute_name, ins.dean FROM institute ins WHERE ins.id = ? ;`,
			[ins_id]
		);

		// Send the institute data as JSON
		res.json({
			success: true,
			data: institutes[0],
		});
	} catch (error) {
		console.error("Error fetching institute data:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
};

const postEditInstitute = async (req, res) => {
	const { institute_id, abbreviation, institute_name, dean } = req.body;

	let errors = [];

	// Validate required fields
	if (!institute_id || !abbreviation || !institute_name || !dean) {
		errors.push({ msg: "Please fill in all required fields." });
	}

	// Check if the institute exists
	const instituteExistQuery =
		"SELECT COUNT(*) as count FROM institute WHERE id = ?";
	const instituteExists = (
		await query(instituteExistQuery, [institute_id])
	)[0].count;
	if (instituteExists === 0) {
		errors.push({ msg: "Institute not found." });
	}

	// Check if the institute name already exists for another institute
	const instituteNameExistQuery =
		"SELECT COUNT(*) as count FROM institute WHERE institute_name = ? AND id != ?";
	const instituteNameCount = (
		await query(instituteNameExistQuery, [institute_name, institute_id])
	)[0].count;
	if (instituteNameCount > 0) {
		errors.push({
			field: "institute_name",
			msg: "Institute name already exists",
		});
	}

	// Check if the abbreviation already exists for another institute
	const abbreviationExistQuery =
		"SELECT COUNT(*) as count FROM institute WHERE abbreviation = ? AND id != ?";
	const abbreviationCount = (
		await query(abbreviationExistQuery, [abbreviation, institute_id])
	)[0].count;
	if (abbreviationCount > 0) {
		errors.push({
			field: "abbreviation",
			msg: "Abbreviation already exists",
		});
	}

	if (errors.length > 0) {
		return res.status(400).json({ success: false, errors });
	}

	try {
		const instituteData = {
			abbreviation,
			institute_name,
			dean,
		};

		// Update the institute in the database
		const instituteSql = "UPDATE institute SET ? WHERE id = ?";
		await query(instituteSql, [instituteData, institute_id]);

		return res.json({
			success: true,
			message: "Institute updated successfully",
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to update institute" });
	}
};

const deleteInstitute = async (req, res) => {
	const { institute_id } = req.body;

	try {
		const deleteQuery = "DELETE FROM institute WHERE id = ?";
		await query(deleteQuery, [institute_id]);
		return res.json({ success: true });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to delete institute." });
	}
};

const getEvaluation = async (req, res) => {
	const usersForEvaluation = await query(
		"SELECT ap.name, ap.id AS application_id FROM application ap WHERE ap.status = 'Approved';"
	);
	res.render("Admin/evaluation", {
		title: "For Evaluation",
		page: "evaluation",
		pagetitle: "For Evaluation",
		usersForEvaluation,
	});
};

const getEvaluationId = async (req, res) => {
	const { id } = req.params;

	const assessors = await query("SELECT * FROM assessor");
	const list_assessors = await query(
		"SELECT a.firstname, a.middlename, a.lastname,a.profile_url,aa.id as assessor_id, a.uuid, aa.application_id AS application_id, aa.status FROM application_assessors aa LEFT JOIN assessor a ON aa.assessor_id = a.uuid WHERE aa.application_id = ?",
		[id]
	);

	res.render("Admin/evaluation_view", {
		title: "Evaluate Applicant",
		page: "evaluation",
		pagetitle: "Evaluate Applicant",
		application_id: id,
		assessors,
		list_assessors,
	});
};

const postAddAssessor = async (req, res) => {
	const { assessor_uuid, application_id } = req.body; // Get assessor UUID and application ID from request body

	let errors = [];

	// Check if the assessor already exists for the application
	const assessorExistQuery =
		"SELECT COUNT(*) as count FROM application_assessors WHERE application_id = ? AND assessor_id = ?";
	const assessorCount = (
		await query(assessorExistQuery, [application_id, assessor_uuid])
	)[0].count;

	if (assessorCount > 0) {
		errors.push({
			field: "assessor_uuid",
			msg: "Assessor already exists for this application",
		});
	}

	// Here, you can add additional checks for the assessor data if needed

	if (errors.length > 0) {
		return res.status(400).json({ success: false, errors });
	}

	try {
		// Prepare data to be inserted into application_assessors table
		const assessorData = {
			application_id,
			assessor_id: assessor_uuid,
			// You can add more fields if required, like 'assigned_date', etc.
		};

		const assessorSql = "INSERT INTO application_assessors SET ?";
		const result = await query(assessorSql, assessorData);

		return res.json({ success: true, assessor_id: result.insertId });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to add assessor" });
	}
};

const removeAssessor = async (req, res) => {
	const { assessor_id, application_id } = req.body;

	try {
		const deleteQuery = "DELETE FROM application_assessors WHERE id = ?";
		await query(deleteQuery, [assessor_id]);
		return res.json({ success: true });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to remove assessor." });
	}
};

const postEvaluation = async (req, res) => {
	const {
		user_id,
		application_id,
		educational_points,
		work_experience_points,
		training_points,
		professional_development_points,
		eligibility_points,
		interview_chief_points,
		interview_assessor_points,
		qualification_status,
	} = req.body;

	// Validate input data
	if (
		educational_points < 0 ||
		work_experience_points < 0 ||
		training_points < 0 ||
		professional_development_points < 0 ||
		eligibility_points < 0 ||
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
			"SELECT * FROM evaluations WHERE user_id = ? AND application_id = ?";
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

		// SQL query to insert a new evaluation if no record exists
		const insertSql =
			"INSERT INTO evaluations (" +
			"user_id, " +
			"application_id, " +
			"educational_points, " +
			"work_experience_points, " +
			"training_points, " +
			"professional_development_points, " +
			"eligibility_points, " +
			"interview_chief_points, " +
			"interview_assessor_points," +
			"status" +
			") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		const values = [
			user_id,
			application_id,
			educational_points,
			work_experience_points,
			training_points,
			professional_development_points,
			eligibility_points,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
		];

		// Execute SQL query to insert the evaluation
		await query(insertSql, values);

		// Return success response
		res.status(201).json({
			success: true,
			message: "Evaluation created successfully",
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
	const {
		user_id,
		application_id,
		educational_points,
		work_experience_points,
		training_points,
		professional_development_points,
		eligibility_points,
		interview_chief_points,
		interview_assessor_points,
		qualification_status,
	} = req.body;

	// Validate input data
	if (
		educational_points < 0 ||
		work_experience_points < 0 ||
		training_points < 0 ||
		professional_development_points < 0 ||
		eligibility_points < 0 ||
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
			"SELECT * FROM evaluations WHERE user_id = ? AND application_id = ?";
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

		// SQL query to update the existing evaluation
		const updateSql =
			"UPDATE evaluations SET " +
			"educational_points = ?, " +
			"work_experience_points = ?, " +
			"training_points = ?, " +
			"professional_development_points = ?, " +
			"eligibility_points = ?, " +
			"interview_chief_points = ?, " +
			"interview_assessor_points = ?, " +
			"status = ? " +
			"WHERE user_id = ? AND application_id = ?";

		const values = [
			educational_points,
			work_experience_points,
			training_points,
			professional_development_points,
			eligibility_points,
			interview_chief_points,
			interview_assessor_points,
			qualification_status,
			user_id,
			application_id,
		];

		// Execute SQL query to update the evaluation
		await query(updateSql, values);

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

const getAssessor = async (req, res) => {
	const users = await query("SELECT * FROM assessor");
	res.render("Admin/assessor", {
		title: "Assessor",
		page: "assessor",
		pagetitle: "Assessor",
		users,
	});
};

const getAssessorView = async (req, res) => {
	const id = req.params.id;
	const assessor_application = await query(
		"SELECT a.id AS application_id, a.name AS applicant_name, a.email AS applicant_email, a.status AS application_status, ass.assessor_id, ass.firstname,ass.uuid, ass.lastname, ass.email AS assessor_email, aa.status AS assessor_status, e.educational_points, e.work_experience_points, e.training_points, e.professional_development_points, e.eligibility_points, e.interview_chief_points, e.interview_assessor_points, e.total_score, e.award_points, e.status AS evaluation_status FROM application a JOIN application_assessors aa ON a.id = aa.application_id JOIN assessor ass ON aa.assessor_id = ass.uuid LEFT JOIN evaluations e ON a.id = e.application_id AND ass.uuid = e.assessor_id WHERE ass.uuid = ?",
		[id]
	);
	const assessor_account = (
		await query("SELECT * FROM assessor WHERE uuid = ?", [id])
	)[0];

	res.render("Admin/assessor_view", {
		title: "View Assessor",
		page: "assessor",
		pagetitle: "View Assessor",
		assessor_application,
		assessor_account,
	});
};

const postAssessor = async (req, res) => {
	const { firstname, lastname, middlename, email } = req.body;

	try {
		const usernameBase =
			firstname.slice(0, 2).toLowerCase() +
			lastname.slice(0, 2).toLowerCase() +
			(middlename ? middlename.slice(0, 2).toLowerCase() : ""); // Optional middlename

		// Calculate the total length of the names
		const nameLength = (firstname + lastname + middlename).length;

		// Combine the base username and the length count
		let username = `${usernameBase}${nameLength}`;

		const existingUser = await query(
			"SELECT * FROM assessor WHERE username = ?",
			[username]
		);

		// If the username exists, regenerate the username by appending 3 random characters
		if (existingUser.length > 0) {
			// Generate a 3-character random string
			const randomString = Math.random().toString(36).substring(2, 5);
			username = `${username}${randomString}`;
		}

		const uuid = nanoid(6);
		const password = nanoid(6);

		// Hash the password before storing
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert into the assessor table
		const query_result = await query(
			"INSERT INTO assessor (uuid,firstname, middlename, lastname, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				uuid,
				firstname,
				middlename,
				lastname,
				email,
				username,
				hashedPassword,
			
			]
		);

		// Send verification email
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			secure: process.env.EMAIL_SECURE,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASS,
			},
		});

		const mailOptions = {
			to: email,
			from: "no-reply@yourorganization.com", // Change to your sending email
			subject: "Assessor Account Created - MMSU ETEEAP",
			html: `<p>Dear ${firstname} ${lastname},</p>
				   <p>Your account has been successfully created by the administrator for the <strong>MMSU ETEEAP</strong> system as an Assessor.</p>
				   <p>Your login credentials are as follows:</p>
				   <ul>
					   <li><strong>Username:</strong> ${username}</li>
					   <li><strong>Password:</strong> ${password}</li> <!-- or the generated password -->
				   </ul>
				   <p>Use these credentials to log in to the system. If you did not request this account, please contact the administrator.</p>
				   <p>Best regards,<br>The MMSU ETEEAP Team</p>`,
		};

		transporter.sendMail(mailOptions, (err) => {
			if (err) {
				console.error(err);
				return res.json({
					success: false,
					msg: "Failed to send assessor account. Please try again later.",
				});
			}

			return res.json({
				success: true,
				message: "Assessor account created successfully",
			});
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message:
				"Failed to create assessor account. Please try again later.",
		});
	}
};
const postAssessorEdit = async (req, res) => {
	const {
		id,
		firstname,
		lastname,
		middlename,
		phonenumber,
		username,
		email,
		birthday,
		password,
		gender,
	} = req.body;

	try {
		let query_result;

		// If password is provided, hash it and update with password
		if (password) {
			const hashedPassword = await bcrypt.hash(password, 10);
			query_result = await query(
				"UPDATE assessor SET firstname = ?, lastname = ?, middlename = ?, phonenumber = ?, username = ?, email = ?, birthday = ?, gender = ?, password = ? WHERE assessor_id = ?",
				[
					firstname,
					lastname,
					middlename,
					phonenumber,
					username,
					email,
					birthday,
					gender,
					hashedPassword,
					id,
				]
			);
		} else {
			// Update without changing the password
			query_result = await query(
				"UPDATE assessor SET firstname = ?, lastname = ?, middlename = ?, phonenumber = ?, username = ?, email = ?, birthday = ?, gender = ? WHERE assessor_id = ?",
				[
					firstname,
					lastname,
					middlename,
					phonenumber,
					username,
					email,
					birthday,
					gender,
					id,
				]
			);
		}

		// Respond with success
		return res.json({
			success: true,
			message: "Assessor updated successfully",
		});
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to update assessor" });
	}
};
const deleteAssessor = async (req, res) => {
	const { assessor_id} = req.body;

	try {
		const deleteQuery = "DELETE FROM assessor WHERE uuid = ?";
		await query(deleteQuery, [assessor_id]);
		return res.json({ success: true, message: "Assessor deleted successfully" });
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ success: false, message: "Failed to remove assessor." });
	}
};
const checkAvailability = async (req, res) => {
	const { user, field, value, id } = req.body;

	let queryStr;
	let queryParams;
	const table = user === "assessor" ? "assessor" : "user"; // Using 'student' or 'users' table based on the user type

	// Base query
	queryStr = `SELECT * FROM ${table} WHERE ${field} = ?`;

	// Initialize query parameters
	queryParams = [value];

	// Check if id exists, if so, add it to the query
	if (id) {
		queryStr += ` AND assessor_id != ?`; // Add the condition for excluding the current ID
		queryParams.push(id); // Add the ID to the query parameters
	}

	try {
		const result = await query(queryStr, queryParams);

		// Return availability status based on the result
		if (result.length > 0) {
			return res.json({ available: false });
		} else {
			return res.json({ available: true });
		}
	} catch (err) {
		console.error(`Database query failed for ${field}:`, err);
		return res
			.status(500)
			.json({ success: false, message: "Database error" });
	}
};

const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/admin/signin");
};
export default {
	getAssessor,
	getSignIn,
	postSignIn,
	checkUsername,
	checkEmail,
	checkPhonenumber,

	getDashboard,

	getApplicationReview,
	getApplicationReviewId,
	postApplicationReviewId,
	postAwardPoints,
	postEmpPoints,
	postTrainingPoints,
	postDevelopmentPoints,
	postApplicationPoints,
	getInterview,
	postInterview,
	editInterview,
	deleteInterview,
	markAsComplete,
	cancelInterview,
	acceptInterview,
	rejectInterview,
	rescheduleInterview,
	sendEmailNotification,
	getEvaluationId,
	getUsers,
	getUserEditId,
	postUserEditId,
	deleteUser,

	getInstitute,
	getInstituteEdit,
	postInstitute,
	postEditInstitute,
	deleteInstitute,

	getEvaluation,
	postEvaluation,
	updateEvaluation,
	postAddAssessor,
	deleteAssessor,
	getLogout,
	checkAvailability,
	postAssessor,
	getAssessorView,
	postAssessorEdit,
	removeAssessor,
};
