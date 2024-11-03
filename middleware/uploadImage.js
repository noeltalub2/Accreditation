import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";

// Use memory storage to avoid writing the original file to disk
const storageConfig = multer.memoryStorage();

const uploadConfig = multer({
	storage: storageConfig,
	limits: {
		fileSize: 5000000, // 5 MB
	},
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(png|jpg|jpeg|JPG)$/)) {
			return cb(new Error("Please upload an image file"));
		}
		cb(null, true);
	},
}).fields([
	{ name: "profile", maxCount: 1 },
	
]);

// Function to process and save the compressed image
const processAndSaveImage = async (file, size, destinationFolder) => {
	if (!file) return;

	const destinationPath = `public/images/${destinationFolder}/`;
	const newFilename = `${Date.now()}-${file.originalname}`;

	try {
		// Process image from buffer and save to disk
		await sharp(file.buffer)
			.resize(size.width, size.height, { fit: "cover" })
			.toFile(path.join(destinationPath, newFilename));

		// Update file to reflect the new file path
		file.path = path.join(destinationPath, newFilename);
		file.filename = newFilename;
	} catch (err) {
		console.error("Failed to process image", err);
		throw err;
	}
};

// Middleware to resize images after they have been uploaded
export const resizeImages = async (req, res, next) => {
	try {
		// Resize profile image to 1:1 aspect ratio
		if (req.files["profile"]) {
			await processAndSaveImage(
				req.files["profile"][0],
				{ width: 500, height: 500 },
				"profile"
			);
		}

		

		next();
	} catch (err) {
		next(err);
	}
};

export { uploadConfig };
