const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional: Test connection on startup
pool.connect()
  .then(() => console.log("✅ Connected to Supabase DB"))
  .catch(err => console.error("❌ DB Connection Error:", err));

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  res.duration = Date.now() - start;
  return res;
};

module.exports = { pool, query };