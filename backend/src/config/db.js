// config/db.js
const { Pool } = require('pg');
const { env } = require('./env');

// Create a Postgres pool
const pool = new Pool({
  connectionString: env.databaseUrl, // Use env.js for consistency
  max: 20, // max clients in the pool
  idleTimeoutMillis: 30000,
  ssl: { 
    rejectUnauthorized: false // Required for Render → Supabase
  },
});

// Optional: Test DB connection on startup
pool.connect()
  .then(() => console.log('✅ Connected to Supabase DB'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  res.duration = Date.now() - start;
  return res;
};

module.exports = { pool, query };
