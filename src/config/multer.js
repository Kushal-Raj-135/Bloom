import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const createUploadDirs = () => {
  const uploadDirs = [
    "uploads/profile-pictures",
    "uploads/crop-images",
    "uploads/documents",
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Storage configuration for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile-pictures");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for crop images
const cropImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/crop-images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "crop-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const err = new Error(
      "Only image files (jpeg, jpg, png, gif, webp) are allowed",
    );
    err.code = "LIMIT_FILE_TYPE";
    cb(err);
  }
};

// Multer configurations
export const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: imageFileFilter,
});

export const cropImageUpload = multer({
  storage: cropImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5,
  },
  fileFilter: imageFileFilter,
});

// General file upload configuration
export const generalUpload = multer({
  dest: "uploads/temp",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10,
  },
});

export default {
  profilePictureUpload,
  cropImageUpload,
  generalUpload,
};
