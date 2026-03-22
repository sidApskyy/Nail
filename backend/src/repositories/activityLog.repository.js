const { query } = require('../config/db');

const create = async ({ userId, action, entityType, entityId }) => {
  const res = await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, action, entityType, entityId || null]
  );
  return res.rows[0];
};

const listAll = async () => {
  const res = await query(
    `SELECT al.*, u.name AS user_name, u.email AS user_email
     FROM activity_logs al
     JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC
     LIMIT 500`,
    []
  );
  return res.rows;
};

module.exports = { create, listAll };
