const { query, pool } = require('../config/db');

const findByEmail = async (email) => {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
};

const findById = async (id) => {
  const res = await query('SELECT id, name, email, role, created_by, is_active, created_at, updated_at FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

const listAll = async () => {
  const res = await query(
    'SELECT id, name, email, role, created_by, is_active, created_at, updated_at FROM users ORDER BY created_at DESC',
    []
  );
  return res.rows;
};

const createUser = async ({ name, email, passwordHash, role, createdBy }) => {
  const res = await query(
    `INSERT INTO users (name, email, password, role, created_by, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING id, name, email, role, created_by, is_active, created_at, updated_at`,
    [name, email, passwordHash, role, createdBy]
  );
  return res.rows[0];
};

const softDelete = async ({ userId }) => {
  const res = await query(
    `UPDATE users
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, is_active`,
    [userId]
  );
  return res.rows[0] || null;
};

const reactivate = async ({ userId }) => {
  const res = await query(
    `UPDATE users
     SET is_active = TRUE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, is_active`,
    [userId]
  );
  return res.rows[0] || null;
};

const getReferencesCount = async ({ userId }) => {
  const appointments = await query('SELECT COUNT(*)::int AS count FROM appointments WHERE created_by = $1', [userId]);
  const works = await query('SELECT COUNT(*)::int AS count FROM completed_works WHERE uploaded_by = $1', [userId]);
  const logs = await query('SELECT COUNT(*)::int AS count FROM activity_logs WHERE user_id = $1', [userId]);
  return {
    appointments: appointments.rows[0].count,
    completedWorks: works.rows[0].count,
    activityLogs: logs.rows[0].count
  };
};

const hardDelete = async ({ userId }) => {
  const res = await query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  return res.rows[0] || null;
};

const updatePassword = async ({ userId, passwordHash }) => {
  const res = await query(
    `UPDATE users
     SET password = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [userId, passwordHash]
  );
  return res.rows[0] || null;
};

const findActiveStaff = async () => {
  const res = await query(
    `SELECT id, name, email, role, created_by, is_active, created_at, updated_at 
     FROM users 
     WHERE role = 'staff' AND is_active = TRUE 
     ORDER BY name ASC`,
    []
  );
  return res.rows;
};

const updateCurrentStaff = async ({ userId, staffId }) => {
  const res = await query(
    `UPDATE users
     SET current_staff_id = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, current_staff_id`,
    [userId, staffId]
  );
  return res.rows[0] || null;
};

const clearCurrentStaff = async (staffId) => {
  const res = await query(
    `UPDATE users
     SET current_staff_id = NULL, updated_at = NOW()
     WHERE current_staff_id = $1`,
    [staffId]
  );
  return res.rows;
};

const nullifyUserReferences = async ({ userId }) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete activity logs for this user FIRST (since they reference users.id)
    const logResult = await client.query(
      'DELETE FROM activity_logs WHERE user_id = $1 RETURNING id',
      [userId]
    );
    
    // Delete completed works uploaded by this user (since they reference appointments)
    const workResult = await client.query(
      'DELETE FROM completed_works WHERE uploaded_by = $1 RETURNING id',
      [userId]
    );
    
    // Delete appointments created by this user (now safe since completed_works no longer reference them)
    const appointmentResult = await client.query(
      'DELETE FROM appointments WHERE created_by = $1 RETURNING id',
      [userId]
    );
    
    // Commit the transaction
    await client.query('COMMIT');
    
    return { 
      appointmentsDeleted: appointmentResult.rowCount,
      worksDeleted: workResult.rowCount,
      logsDeleted: logResult.rowCount
    };
    
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Always release the client
    client.release();
  }
};

module.exports = {
  findByEmail,
  findById,
  listAll,
  createUser,
  softDelete,
  reactivate,
  getReferencesCount,
  hardDelete,
  updatePassword,
  findActiveStaff,
  updateCurrentStaff,
  clearCurrentStaff,
  nullifyUserReferences
};
