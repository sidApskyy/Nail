// config/db.js

const { Pool } = require('pg');
const { env } = require('./env');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.databaseUrl,

  // Pool settings
  max: 20,
  idleTimeoutMillis: 30000,

  // 🔥 REQUIRED for Supabase (SSL)
  ssl: {
    rejectUnauthorized: false
  },

  // 🔥 CRITICAL FIX: Force IPv4 (fixes ENETUNREACH error on Render)
  family: 4
});

// Test DB connection on startup
pool.connect()
  .then(() => {
    console.log("✅ Connected to Supabase DB");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// Helper function for queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Optional: log slow queries
    if (duration > 500) {
      console.log('⚠️ Slow query detected:', { text, duration });
    }

    return res;
  } catch (err) {
    console.error('❌ Query Error:', err);
    throw err;
  }
};

module.exports = { pool, query };
