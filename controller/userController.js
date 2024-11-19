import query from "../database/query_db.js";
import db from "../database/connect_db.js";
import bcrypt, { compareSync } from "bcrypt";
import createToken from "../utils/token.js";
import { nanoid } from "nanoid";
import crypto from "crypto";
import nodemailer from "nodemailer";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
// __dirname is not available in ES modules, so we need to derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getNotifications = async (req, res) => {
	const { userId } = req.body;
	const notifications = await query(
		"SELECT * FROM notifications WHERE user_uuid = ? ORDER BY id DESC",
		[userId]
	);
	res.status(200).json({ notifications });
};
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
const getSignIn = (req, res) => {
	res.render("User/signin", {
		title: "Sign In",
		username: req.flash("username")[0],
	});
};
const postSignIn = (req, res) => {
	try {
		const { username, password } = req.body;
		const findUser = "SELECT * FROM users WHERE username = ?";

		db.query(findUser, [username], async (err, result) => {
			if (err) {
				req.flash("error_msg", "Authentication failed.");
				res.redirect("/signin");
			} else {
				if (result.length > 0) {
					const user = result[0];

					// Check if the user's email is verified
					if (user.is_verified !== 1) {
						req.flash(
							"error_msg",
							"Please verify your email before signing in."
						);
						res.redirect("/signin");
						return;
					}

					const match_password = await bcrypt.compare(
						password,
						user.password
					);
					if (match_password) {
						const generateToken = createToken(
							user.uuid,
							user.username,
							"user"
						);
						res.cookie("token", generateToken, {
							httpOnly: true,
						});
						res.redirect("/home");
					} else {
						req.flash(
							"error_msg",
							"Incorrect username or password"
						);
						req.flash("username", username); // Flash the username
						res.redirect("/signin");
					}
				} else {
					req.flash("error_msg", "Couldn't find your account");
					res.redirect("/signin");
				}
			}
		});
	} catch (err) {
		console.error(err); // Log the error for debugging
		req.flash("error_msg", "An error occurred during authentication.");
		res.redirect("/signin");
	}
};

const getSignUp = (req, res) => {
	res.render("User/signup", { title: "Sign Up" });
};

const postSignUp = async (req, res) => {
	const profile =
		req.files && req.files.profile
			? req.files.profile[0].filename
			: "default.jpg";

	// Data from the form
	const {
		firstname,
		lastname,
		middlename,
		phonenumber,
		username,
		email,
		birthday,
		gender,
		password,
		confirm_password,
	} = req.body;

	let errors = [];

	// Validate that all required fields are provided
	if (
		!firstname ||
		!lastname ||
		!phonenumber ||
		!username ||
		!email ||
		!birthday ||
		!gender ||
		!password ||
		!confirm_password
	) {
		errors.push({ msg: "Please fill in all fields" });
	}

	// Check if passwords match
	if (password !== confirm_password) {
		errors.push({ msg: "Passwords do not match" });
	}

	// Check if the username, phone number, or email already exists
	const username_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE username = ?";
	const phone_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE phonenumber = ?";
	const email_exist = "SELECT COUNT(*) as `count` FROM users WHERE email = ?";

	try {
		const username_count = (await query(username_exist, [username]))[0]
			.count;
		const phone_count = (await query(phone_exist, [phonenumber]))[0].count;
		const email_count = (await query(email_exist, [email]))[0].count;

		if (username_count > 0) {
			errors.push({ msg: "Username is already taken" });
		}
		if (phone_count > 0) {
			errors.push({ msg: "Phone number is already registered" });
		}
		if (email_count > 0) {
			errors.push({ msg: "Email is already registered" });
		}
	} catch (err) {
		console.error(err);
		return res.json({
			success: false,
			errors: [{ msg: "Database error occurred" }],
		});
	}

	// If there are errors, send them as JSON
	if (errors.length > 0) {
		return res.json({ success: false, errors });
	} else {
		// Hash the password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Data to insert into SQL
		const data = {
			uuid: nanoid(6),
			firstname,
			lastname,
			middlename,
			phonenumber,
			username,
			email,
			birthday,
			gender,
			password: hashedPassword,
			profile_url: profile,
			is_verified: false, // Add a field to check if email is verified
			verification_token: nanoid(), // Generate a unique verification token
		};

		// Insert new user into database
		const sql = "INSERT INTO users SET ?";
		db.query(sql, data, (err, result) => {
			if (err) {
				console.error(err);
				return res.json({
					success: false,
					errors: [{ msg: "Failed to register user" }],
				});
			} else {
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

				const verificationLink = `http://${req.headers.host}/verify-email/${data.verification_token}`;

				const mailOptions = {
					to: email,
					from: "no-reply@yourorganization.com", // Change to your sending email
					subject: "Verify Your Email Address - MMSU ETEEAP",
					html: `<p>Dear ${firstname},</p>
						   <p>Thank you for signing up with <strong>MMSU ETEEAP</strong>!</p>
						   <p>To complete your registration, please verify your email address by clicking the link below:</p>
						   <p><a href="${verificationLink}">Verify your email</a></p>
						   <p>If you did not register for an account, please ignore this email. Your account will not be activated unless you follow the verification link.</p>
						   <p>Best regards,<br>The MMSU ETEEAP Team</p>`,
				};

				transporter.sendMail(mailOptions, (err) => {
					if (err) {
						console.error(err);
						return res.json({
							success: false,
							msg: "Failed to send verification email",
						});
					}

					return res.json({
						success: true,
						msg: "Registration successful! Please check your email for a verification link.",
					});
				});
			}
		});
	}
};

const getVerifyEmail = async (req, res) => {
	const { token } = req.params;

	const data = await query(
		"SELECT * FROM users WHERE verification_token = ?",
		[token]
	);

	if (data.length === 0) {
		return res.redirect("/signin");
	} else {
		const updateSql = await query(
			"UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?",
			[token]
		);

		res.render("User/verify-email", {
			title: "Verify Email",
			email: data[0].email,
		});
	}
};

const getReqPass = (req, res) => {
	res.render("User/request-reset", { title: "Request Password Reset" });
};

const postReqPass = async (req, res) => {
	const { email } = req.body;

	const user = await query("SELECT * FROM users WHERE email = ?", [email]);

	if (user.length === 0) {
		return res.status(400).json({
			success: false,
			errors: [{ field: "email", msg: "This email is not registered." }],
		});
	}
	const token = crypto.randomBytes(20).toString("hex");
	const expiry = Date.now() + 3600000; // 1 hour

	db.query(
		"UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?",
		[token, expiry, email],
		(err, result) => {
			if (err) throw err;

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
				from: "passwordreset@demo.com",
				subject: "Password Reset",
				text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
			   Please click on the following link, or paste this into your browser to complete the process:\n\n
			   http://${req.headers.host}/reset-password/${token}\n\n
			   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
			};

			transporter.sendMail(mailOptions, (err) => {
				if (err) throw err;

				return res.json({
					success: true,
					msg: "An email with a password reset link has been sent.",
				});
			});
		}
	);
};

const getResetPass = async (req, res) => {
	db.query(
		"SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?",
		[req.params.token, Date.now()],
		(err, user) => {
			if (err) throw err;
			if (!user.length) {
				return res.redirect("/signin");
			}
			res.render("User/reset-password", { token: req.params.token , title: "Reset Password"});
		}
	);
};

const postResetPass = async (req, res) => {
	const { token, confirm_password } = req.body;

	db.query(
		"SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?",
		[token, Date.now()],
		(err, user) => {
			if (err) throw err;
			if (!user.length) {
				return res.json({
					success: false,
					msg: "Password reset token is invalid or has expired.",
				});
			}

			const hashedPassword = bcrypt.hashSync(confirm_password, 10);

			db.query(
				"UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?",
				[hashedPassword, token],
				(err) => {
					if (err) throw err;

					return res.status(200).json({
						success: true,
						msg: "Password has been reset successfully.",
					});
				}
			);
		}
	);
};

const checkUsername = async (req, res) => {
	const { username, uuid } = req.body;

	let queryStr;
	let queryParams;

	// If UUID is provided, exclude it from the result
	if (uuid) {
		queryStr = "SELECT * FROM users WHERE username = ? AND uuid != ?";
		queryParams = [username, uuid];
	} else {
		queryStr = "SELECT * FROM users WHERE username = ?";
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
		queryStr = "SELECT * FROM users WHERE email = ? AND uuid != ?";
		queryParams = [email, uuid];
	} else {
		queryStr = "SELECT * FROM users WHERE email = ?";
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
		queryStr = "SELECT * FROM users WHERE phonenumber = ? AND uuid != ?";
		queryParams = [phonenumber, uuid];
	} else {
		queryStr = "SELECT * FROM users WHERE phonenumber = ?";
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

const getHome = async (req, res) => {
	const userId = res.locals.user.id;
	const count_application = (
		await query(
			"SELECT COUNT(*) AS total_applications FROM application WHERE uuid = ?",
			[userId]
		)
	)[0].total_applications;

	const interview = await query(
		"SELECT * FROM interviews WHERE user_id = ? ORDER BY id DESC LIMIT 1",
		[userId]
	);
	res.render("User/home", {
		title: "Dashboard",
		page: "home",
		pagetitle: "Dashboard",
		interview,
		count_application,
	});
};

const getApplications = async (req, res) => {
	const userId = res.locals.user.id;
	const applications = await query(
		"SELECT a.* FROM application a WHERE a.uuid = ? ORDER BY a.id DESC;",
		[userId]
	);

	// Render the page with updated project data
	res.render("User/application", {
		title: "My Application",
		page: "application_form",
		pagetitle: "My Applications",
		applications,
	});
};

const getSubmitApplication = async (req, res) => {
	const userId = res.locals.user.id;
	const userProfile = (
		await query("SELECT * FROM users WHERE uuid = ?", [userId])
	)[0];

	// Render the page with updated project data
	res.render("User/submit_application", {
		title: "Submit Application Form",
		page: "application_form",
		pagetitle: "Submit Application Form",
		userProfile,
	});
};

const postApplicationForm = async (req, res) => {
    const userId = res.locals.user.id;

    // Arrays from req.body
    const {
        // Work Experience
        job_title,
        company_name_work,
        company_address_work,
        date_started_end_work,
        employment_file_work,

        // Training
        training_level,
        training_title,
        training_sponsor,
        training_date,
        training_certificate,

        // Professional Development
        professional_dev_level,
        organization_dev,
        description_dev,
        certificate_file_dev,

        // Award
        award_level,
        certificate_file_award
    } = req.body;


	
    // Other fields (non-array)
    const {
        name,
        address,
        zip_code,
        phonenumber,
        email,
        birth_date,
        birthplace,
        civil_status,
        sex,
        nationality,
        languages,
        first_priority,
        second_priority,
        third_priority,
        cost_accreditation,
        time_commitment,
        qualification,
        school_name,
        school_address,
        date_first_attended,
        date_last_attended,
        final_essay,
        hobbies_leisure,
        special_skills,
        work_related_activities,
        volunteer_activities,
        travels,
    } = req.body;

    try {
        // Check if the user has an existing application in progress
        const existingApplication = await query(
            "SELECT * FROM application WHERE uuid = ? AND status IN (?, ?, ?, ?)",
            [
                userId,
                "Pending",
                "Under Review",
                "Additional Information Requested",
                "Approved",
            ]
        );

        if (existingApplication.length > 0) {
            return res.status(400).json({
                message:
                    "You already have a current application that is still being processed or approved.",
            });
        }

        // Insert into the application table
        const result = await query(
            `INSERT INTO application (
                uuid, name, address, zip_code, phonenumber, email, birth_date, 
                birthplace, civil_status, sex, nationality, languages, first_priority, 
                second_priority, third_priority, cost_accreditation, time_commitment, 
                qualification, school_name, school_address, date_first_attended, 
                date_last_attended, final_essay, tor_file, certificate_file_sub_professional,
                certificate_file_technical_nc, certificate_file_professional_prc_csc, hobbies_leisure,
                special_skills, work_related_activities, volunteer_activities, travels
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId || null,
                name || null,
                address || null,
                zip_code || null,
                phonenumber || null,
                email || null,
                birth_date || null,
                birthplace || null,
                civil_status || null,
                sex || null,
                nationality || null,
                languages || null,
                first_priority || null,
                second_priority || null,
                third_priority || null,
                cost_accreditation || null,
                time_commitment || null,
                qualification || null,
                school_name || null,
                school_address || null,
                date_first_attended || null,
                date_last_attended || null,
                final_essay || null,
                // Handle file uploads
                req.files.find((file) => file.fieldname === "tor_file")?.filename || null,
                req.files.find((file) => file.fieldname === "certificate_file_sub_professional")?.filename || null,
                req.files.find((file) => file.fieldname === "certificate_file_technical_nc")?.filename || null,
                req.files.find((file) => file.fieldname === "certificate_file_professional_prc_csc")?.filename || null,
                hobbies_leisure || null,
                special_skills || null,
                work_related_activities || null,
                volunteer_activities || null,
                travels || null,
            ]
        );

        // Get the application ID for the newly inserted application
        const applicationId = result.insertId;

        // Insert into work_experience table (batch insert)
        if (job_title && job_title.length > 0) {
            const workExperienceData = job_title.map((item, index) => [
                applicationId,
                item,
                company_name_work[index] || null,
                company_address_work[index] || null,
                date_started_end_work[index] || null,
                req.files.find((file) => file.fieldname === `employment_file_work[${index}]`)?.filename || null // Find the file for this index
            ]);
            await query(
                `INSERT INTO work_experience (application_id, job_title, company_name, company_address, date_started_end, employment_file) 
                VALUES ?`,
                [workExperienceData]
            );
        }

        // Insert into training table (batch insert)
        if (training_title && training_title.length > 0) {
            const trainingData = training_title.map((item, index) => [
                applicationId,
                training_level[index] || null,
                item,
                training_sponsor[index] || null,
                training_date[index] || null,
          
				req.files.find((file) => file.fieldname === `training_certificate[${index}]`)?.filename || null,
            ]);
            await query(
                `INSERT INTO training (application_id, training_level, training_title, training_sponsor, training_date, training_certificate)
                VALUES ?`,
                [trainingData]
            );
        }

        // Insert into professional_development table (batch insert)
        if (professional_dev_level && professional_dev_level.length > 0) {
            const professionalDevelopmentData = professional_dev_level.map((item, index) => [
                applicationId,
                item,
                organization_dev[index] || null,
                description_dev[index] || null,
             
				req.files.find((file) => file.fieldname === `certificate_file_dev[${index}]`)?.filename || null,
            ]);
            await query(
                `INSERT INTO professional_development (application_id, professional_dev_level, organization_dev, description_dev, certificate_file_dev)
                VALUES ?`,
                [professionalDevelopmentData]
            );
        }

        // Insert into award table (batch insert)
        if (award_level && award_level.length > 0) {
            const awardData = award_level.map((item, index) => [
                applicationId,
                item,
                
				req.files.find((file) => file.fieldname === `certificate_file_award[${index}]`)?.filename || null,
            ]);
            await query(
                `INSERT INTO award (application_id, award_level, certificate_file_award)
                VALUES ?`,
                [awardData]
            );
        }

        res.status(200).json({
            success: true,
            message: "You have successfully submitted your application.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting application." });
    }
};


const getSubmitApplicationView = async (req, res) => {
	const hasAccess = await query("SELECT * FROM application WHERE uuid = ? AND id = ?", [res.locals.user.id, req.params.id]);
	if (hasAccess.length === 0) {
		return res.redirect("/application");
	}
	const application = (
		await query("SELECT * FROM application WHERE uuid = ? AND id = ?", [
			res.locals.user.id,
			req.params.id,
		])
	)[0];
	const workExperience = await query(
		"SELECT * FROM work_experience WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	)
	const trainingExperience = await query(
		"SELECT * FROM training WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	)
	const professionalDevelopments = await query(
		"SELECT * FROM professional_development WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	)
	const awards = await query(
		"SELECT * FROM award WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	)
	const comments = await query(
		"SELECT * FROM comments WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	);
	const interview_ = await query(
		"SELECT * FROM interviews WHERE user_id = ? AND application_id = ? ORDER BY id DESC",
		[res.locals.user.id, req.params.id]
	);

	const interview = interview_.length > 0 ? interview_[0] : [];
	const evaluations = await query(
		"SELECT * FROM evaluations WHERE application_id = ? ORDER BY id DESC",
		[req.params.id]
	);

	// Render the page with updated project data
	res.render("User/application_view", {
		title: "View Submitted Application Form",
		page: "application_form",
		pagetitle: "View Submitted Application Form",
		application,
		comments,
		interview,
		evaluations,
		workExperience,trainingExperience,professionalDevelopments,awards
	});
};

const postApplicationDocument = async (req, res) => {
	const attachments = req.files ? req.files : []; // Assuming you're using a file upload library like Multer
	const { id } = req.body;
	try {
		// Insert the main document record

		// If attachments were uploaded, insert them into the attached_documents table
		if (attachments.length > 0) {
			const insertPromises = attachments.map((file) =>
				query(
					"INSERT INTO attached_documents (application_id, file_name) VALUES (?, ?)",
					[id, file.filename] // Accessing the filename of each uploaded file
				)
			);

			// Await all insertions to complete
			await Promise.all(insertPromises);
		}

		res.status(200).json({
			success: true,
			message: "You have successfully submitted your documents.",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error uploading." });
	}
};

const deleteDocumentUpload = async (req, res) => {
	const documentId = req.params.id;

	try {
		// Fetch the document from the database
		const document = (
			await query("SELECT * FROM attached_documents WHERE id = ?", [
				documentId,
			])
		)[0];

		if (document) {
			const filePath = path.join(
				__dirname,
				"..",
				"public",
				"uploads",
				document.file_name
			);

			// Delete the file from the file system
			fs.unlink(filePath, async (err) => {
				if (err) {
					console.error("File deletion error:", err);
					return res.status(500).send("Error deleting file.");
				}

				// Delete the document record from the database
				await query("DELETE FROM attached_documents WHERE id = ?", [
					documentId,
				]);
				res.redirect(`/application/${document.application_id}/view`);
			});
		} else {
			res.status(404).send("Document not found.");
		}
	} catch (err) {
		console.error("Server error:", err);
		res.status(500).send("Server error.");
	}
};

const getInterview = async (req, res) => {
	const userId = res.locals.user.id;
	const interview = await query(
		"SELECT * FROM interviews WHERE user_id = ? ORDER BY id DESC",
		[userId]
	);

	res.render("User/interview", {
		title: "Interview",
		page: "interview",
		pagetitle: "Interview",
		interview,
	});
};
const postInterview = async (req, res) => {
	const user_id = res.locals.user.id;
	const { interview_date, application_id, interview_time } = req.body;
	console.log(req.body);
	try {
		// Check for existing pending interviews on the same date for the same user
		const existingInterviews = await query(
			`SELECT COUNT(*) as count FROM interviews 
             WHERE user_id = ? AND status = 'Pending'`,
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
			`INSERT INTO interviews (user_id, application_id, interview_date, interview_time) VALUES ( ?,?, ?, ?)`,
			[user_id, application_id, interview_date, interview_time]
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

const rescheduleInterview = async (req, res) => {
    const { id } = req.params; // Get interview ID from the route parameters
    const { interview_date, interview_time } = req.body; // Removed email and firstname from req.body

    try {
        // Update the interview date, time, and status
        const result = await query(
            "UPDATE interviews SET interview_date = ?, interview_time = ?, status = ? WHERE id = ?",
            [interview_date, interview_time, "Rescheduled", id]
        );

        // Check if the update was successful
        if (result.affectedRows === 1) {
            res.status(200).json({
                success: true,
                message: "Interview rescheduled successfully.",
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


const getProfile = async (req, res) => {
	const uuid = res.locals.user.id;
	const profile = (
		await query("SELECT * FROM users WHERE uuid = ?", [uuid])
	)[0];

	res.render("User/profile", {
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
		"SELECT COUNT(*) as `count` FROM users WHERE phonenumber = ? AND uuid != ?";
	const email_exist =
		"SELECT COUNT(*) as `count` FROM users WHERE email = ? AND uuid != ?";

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
			"UPDATE users SET ? , modified_at = CURRENT_TIMESTAMP WHERE uuid = ?";

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
			await query("SELECT * FROM users WHERE uuid = ?", [userId])
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

		await query("UPDATE users SET password = ? WHERE uuid = ?", [
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
	getNotifications,
	getSignIn,
	postSignIn,
	getSignUp,
	postSignUp,
	getVerifyEmail,
	getReqPass,
	postReqPass,
	getResetPass,
	postResetPass,
	checkEmail,
	checkPhonenumber,
	checkUsername,
	getHome,

	getApplications,
	getSubmitApplication,
	postApplicationForm,

	getSubmitApplicationView,
	postApplicationDocument,
	deleteDocumentUpload,

	getInterview,
	postInterview,
	acceptInterview,
	rejectInterview,
	rescheduleInterview,
	getProfile,
	postProfile,
	postChangePass,
};
