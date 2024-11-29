import query from "../database/query_db.js";
import db from "../database/connect_db.js";


import PDFDocument from "pdfkit";
import fs from "fs";
const getIndex = (req, res) => {
	res.render("index", { title: "Homepage" });
};
const generateEvaluationId = async (req, res) => {
	const application_id = req.params.application_id;
	const assessor_id = req.params.assessor_id;

	const course_first_priority = (
		await query("SELECT first_priority FROM application WHERE id = ?", [
			application_id,
		])
	)[0].first_priority;

	const evaluation_result = (
		await query(
			"SELECT e.*,CONCAT( UPPER(a.firstname), ' ', UPPER(LEFT(a.middlename, 1)), '. ', UPPER(a.lastname) ) AS assessor_full_name, ap.name FROM evaluations e LEFT JOIN assessor a ON a.uuid = e.assessor_id LEFT JOIN application ap ON ap.id = e.application_id WHERE e.assessor_id = ? AND e.application_id = ?;",
			[assessor_id, application_id]
		)
	)[0];

	function formatDate(dateString) {
		const date = new Date(dateString);
		const options = { day: "numeric", month: "long" };
		return date.toLocaleDateString("en-US", options);
	}

	function formatTime(dateString) {
		const date = new Date(dateString);
		const options = { hour: "numeric", minute: "numeric", hour12: true };
		return date.toLocaleTimeString("en-US", options);
	}
	const dateString =
		evaluation_result.updated_at || evaluation_result.created_at;
	const formattedDate = formatDate(dateString); // "23 October"
	const formattedTime = formatTime(dateString); // "4:54 AM"

	// Create a new PDF document
	const doc = new PDFDocument();

	// Pipe the PDF into a file or directly to the response
	const filename = "Documentary_Evaluation_Report.pdf";
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	doc.pipe(res);
	const logoBase64 = "public/assets/images/mmsu_logo.png"
	// Use a fixed-width font
	doc.font("Courier");
	// Add MMSU Header
	// Add logo at the top-left
doc.image(logoBase64, 65, 65, { // Position the logo (50, 50) can be adjusted
    width: 50, // Adjust logo width if needed
    height: 50, // Adjust logo height if needed
});
	doc.fontSize(12)
		.text("MARIANO MARCOS STATE UNIVERSITY", { align: "center" })
		.moveDown(0.5)
		.text(
			"Expanded Tertiary Education Equivalency and\n Accreditation Program",
			{ align: "center" }
		)
		.moveDown(0.5)
		.text("DOCUMENTARY EVALUATION REPORT", {
			align: "center",
			underline: true,
		})
		.moveDown(2);

	// Document details
	doc.text("Document Code: ETEEAP-FRM-001", { align: "left" }).moveDown(0.5);

	// Candidate Information
	doc.fontSize(10)
		.text(`Candidate  :  ${evaluation_result.name}`, { align: "left" })
		.text(`Degree Applied for: ${course_first_priority}`, { align: "left" })

		.text(`Date of evaluation:  ${formattedDate} `, {
			align: "left",
		})
		.text(`Time:  ${formattedTime}`, { align: "left" })
		.text("Venue: CIT", { align: "left" })
		.moveDown(2);

	// Define criteria data
	const criteria = [
		{
			criterion: "Education Qualification",
			maxPoints: 20,
			pointsObtained: evaluation_result.educational_points,
		},
		{
			criterion: "Work experience",
			maxPoints: 40,
			pointsObtained: evaluation_result.work_experience_points,
		},
		{
			criterion: "Professional achievement",
			maxPoints: 25,
			pointsObtained:
				parseInt(evaluation_result.training_points) +
				parseInt(evaluation_result.professional_development_points) +
				parseInt(evaluation_result.eligibility_points) +
				parseInt(evaluation_result.award_points),
		},
		{
			criterion: "Interview",
			maxPoints: 15,
			pointsObtained:
				parseInt(evaluation_result.interview_chief_points) +
				parseInt(evaluation_result.interview_assessor_points),
		},
	];

	// Set font size and title
	doc.fontSize(10)
		.text("Summary of Results:", { align: "left" })
		.moveDown(0.5);

	// Add headers for the table
	const headerText = `${"Criteria".padEnd(35)}${"Maximum Points".padEnd(
		20
	)}${"Points Obtained".padStart(15)}`;
	doc.text(headerText, { align: "left" });
	doc.moveDown(0.5); // Space between header and data

	// Add each criterion
	criteria.forEach((item) => {
		const text = `${item.criterion.padEnd(35)}${item.maxPoints
			.toString()
			.padStart(8)}${item.pointsObtained.toString().padStart(20)}`;
		doc.text(text, { align: "left" });
	});

	// Add total row
	doc.moveDown(1)
		.text("Total".padEnd(50) + evaluation_result.total_score, {
			align: "left",
		})
		.moveDown(1);

	// Recommendation Box
	doc.fontSize(10)
		.text("Recommendation:", { align: "left" })
		.moveDown(1)
		.rect(70, doc.y, 500, 70) // Draw recommendation box
		.stroke()
		.moveDown(8);
// Credited Subjects Table
doc.fontSize(10).text("Credited Subjects:", { align: "left" }).moveDown(0.5);
doc.text("Subject".padEnd(30) + "Unit".padEnd(10) + "Subject".padEnd(30) + "Unit", {
  align: "left",
});
doc.text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .moveDown(2);

// Subjects to Enroll Table
doc.fontSize(10).text("Subjects to Enroll:", { align: "left" }).moveDown(0.5);
doc.text("Subject".padEnd(30) + "Unit".padEnd(10) + "Subject".padEnd(30) + "Unit", {
  align: "left",
});
doc.text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .text("____________________________".padEnd(30) + "_____".padEnd(10) + "____________________________".padEnd(30) + "_____")
   .moveDown(2);


// Submitted, Recommended, and Approved By Section
const startY = doc.y; // Store the starting Y position for alignment

// Submitted by
doc.fontSize(10)
   .text("Submitted by:", 70, startY)
   .text(`${evaluation_result.assessor_full_name}`, 70, startY + 15, { underline: true })
   .text("Internal Assessor", 70, startY + 30)
   .text("Date Signed:", 70, startY + 45);

// Recommended by
doc.text("Recommended by:", 210, startY)
   .text("JEAN P. PACUBAT", 210, startY + 15, { underline: true })
   .text("Registrar", 210, startY + 30)
   .text("Date Signed:", 210, startY + 45);

// Approved by (Dean)
doc.text("Approved by:", 320, startY)
   .text("CESARIO Y. PACIS", 320, startY + 15, { underline: true })
   .text("Dean", 320, startY + 30)
   .text("Date Signed:", 320, startY + 45);

// Approved by (Chief, ETEEAP)
doc.text("ROBERT A. SALVADOR", 430, startY + 15, { underline: true })
   .text("Chief, ETEEAP", 430, startY + 30)
   .text("Date Signed:", 430, startY + 45);

	doc.end();
};
const getLogout = (req, res) => {
	res.clearCookie("token");
	res.redirect("/signin");
};

const getError403 = (req, res) => {
	res.render("unauthorized", { title: "403 - Unauthorized" });
};
const getError404 = (req, res) => {
	res.render("notfound", { title: "404 - Not found" });
};
export default {
	getIndex,
	generateEvaluationId,
	getLogout,
	getError403,
	getError404,
};
