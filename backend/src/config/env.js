const dotenv = require('dotenv');

dotenv.config();

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  // 🔥 IMPORTANT for Render
  port: process.env.PORT || 4000,

  // 🔥 Supabase PostgreSQL connection
  databaseUrl: required('DATABASE_URL'),

  // 🔐 Security / Auth
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    accessTokenSecret: required('ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: required('REFRESH_TOKEN_SECRET'),
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
    refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'rt'
  },

  // ⚠️ Temporary (will replace later with cloud storage)
  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeBytes: 6 * 1024 * 1024 // 6MB
  }
};

module.exports = { env };