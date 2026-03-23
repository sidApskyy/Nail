const { Pool } = require('pg');
const { env } = require('./env');

const isProduction = env.nodeEnv === 'production';

const pool = new Pool({
  connectionString: env.databaseUrl,

  max: 20,
  idleTimeoutMillis: 30000,

  // ✅ Bulletproof SSL handling
  ssl: isProduction
    ? {
        rejectUnauthorized: false
      }
    : false,

  // ✅ Force IPv4 (Render fix)
  family: 4
});

// Test connection
pool.connect()
  .then(() => {
    console.log("✅ Connected to Supabase DB");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

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
