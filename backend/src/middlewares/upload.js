const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

const ensureUploadDir = () => {
  const dir = path.join(process.cwd(), env.uploads.dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, safeExt).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, `${Date.now()}_${base}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.has(ext)) {
    return cb(new ApiError(400, 'Invalid file type. Allowed: jpg, jpeg, png, webp'));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploads.maxFileSizeBytes
  }
});

// Optional upload middleware - doesn't fail if no file is provided
const uploadOptional = upload.single('image');

module.exports = { upload, uploadOptional };
