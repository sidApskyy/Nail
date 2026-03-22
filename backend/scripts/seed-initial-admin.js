const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const main = async () => {
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    // eslint-disable-next-line no-console
    console.log('Admin already exists:', existing.rows[0].id);
    return;
  }

  const insert = await pool.query(
    `INSERT INTO users (name, email, password, role, created_by, is_active)
     VALUES ($1, $2, $3, 'admin', NULL, TRUE)
     RETURNING id, email, role`,
    [name, email, passwordHash]
  );

  // eslint-disable-next-line no-console
  console.log('Created initial admin:', insert.rows[0]);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
