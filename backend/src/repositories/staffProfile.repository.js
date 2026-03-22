const { query } = require('../config/db');

const create = async ({ name, email, phone, role, createdBy }) => {
  const res = await query(
    `INSERT INTO staff_profiles (name, email, phone, role, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, phone, role, createdBy]
  );
  return res.rows[0];
};

const findByEmail = async (email) => {
  const res = await query('SELECT * FROM staff_profiles WHERE email = $1', [email]);
  return res.rows[0] || null;
};

const findById = async (id) => {
  const res = await query('SELECT * FROM staff_profiles WHERE id = $1', [id]);
  return res.rows[0] || null;
};

const findActive = async () => {
  const res = await query(
    `SELECT * FROM staff_profiles 
     WHERE is_active = TRUE 
     ORDER BY name ASC`,
    []
  );
  return res.rows;
};

const findCurrentStaff = async (userId) => {
  const res = await query(
    `SELECT sp.* FROM staff_profiles sp
     JOIN users u ON u.current_staff_id = sp.id
     WHERE u.id = $1`,
    [userId]
  );
  return res.rows[0] || null;
};

const deactivate = async (staffId) => {
  const res = await query(
    `UPDATE staff_profiles
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [staffId]
  );
  return res.rows[0] || null;
};

module.exports = {
  create,
  findByEmail,
  findById,
  findActive,
  findCurrentStaff,
  deactivate
};
