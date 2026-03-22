const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: false
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  res.duration = Date.now() - start;
  return res;
};

module.exports = { pool, query };
