// config/env.js
const dotenv = require('dotenv');

dotenv.config();

// Helper to require environment variables
const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',

  // 🔥 Important for Render
  port: process.env.PORT || 4000, // Render will provide PORT automatically

  // 🔥 Supabase PostgreSQL connection
  databaseUrl: required('DATABASE_URL'), // must be full host URL

  // 🔐 Security / Auth
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173', // frontend URL
    accessTokenSecret: required('ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: required('REFRESH_TOKEN_SECRET'),
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'rt',
  },

  // ⚠️ File Uploads (Render storage is ephemeral; consider S3 for production)
  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeBytes: 6 * 1024 * 1024, // 6MB
  },

  // Optional: log level
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = { env };
