import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists
const uploadDir = 'public/uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Specify the destination for the uploaded files
    },
    filename: (req, file, cb) => {
        // Sanitize the original name of the file
        const originalName = file.originalname.replace(/[^a-z0-9.]/gi, '-').toUpperCase(); // Sanitize filename

        // Get the current time in milliseconds
        const milliseconds = Date.now(); // Get the current timestamp in milliseconds

        const ext = path.extname(originalName); // Get the file extension
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')); // Get the name without extension

        // Save with original name and milliseconds
        cb(null, `${nameWithoutExt}-${milliseconds}${ext}`);
    }
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/; // Define allowed file types
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); // Accept the file
    } else {
        cb(new Error('Error: Only PDF, JPG, and PNG files are allowed!'), false); // Reject the file
    }
};

// Set up Multer upload with limits and filter
const uploadDocument = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 5 MB limit
    }
});



export { uploadDocument };
