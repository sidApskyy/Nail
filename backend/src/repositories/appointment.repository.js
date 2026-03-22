const { query } = require('../config/db');

const create = async ({ customerName, customerPhone, appointmentDate, appointmentTime, createdBy, createdByName }) => {
  const res = await query(
    `INSERT INTO appointments (customer_name, customer_phone, appointment_date, appointment_time, created_by, created_by_name, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [customerName, customerPhone, appointmentDate, appointmentTime, createdBy, createdByName]
  );
  return res.rows[0];
};

const listAll = async () => {
  const res = await query(
    `SELECT a.*, 
            COALESCE(a.created_by_name, u.name, 'Unknown') AS staff_name,
            u.email AS staff_email
     FROM appointments a
     LEFT JOIN users u ON u.id = a.created_by
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    []
  );
  return res.rows;
};

const listByStaff = async ({ staffId }) => {
  const res = await query(
    `SELECT * FROM appointments WHERE created_by = $1 ORDER BY appointment_date DESC, appointment_time DESC`,
    [staffId]
  );
  return res.rows;
};

const listByStaffAndStatus = async ({ staffId, status }) => {
  const res = await query(
    `SELECT * FROM appointments WHERE created_by = $1 AND status = $2 ORDER BY appointment_date DESC, appointment_time DESC`,
    [staffId, status]
  );
  return res.rows;
};

const findById = async ({ id }) => {
  const res = await query('SELECT * FROM appointments WHERE id = $1', [id]);
  return res.rows[0] || null;
};

const setStatus = async ({ id, status }) => {
  const res = await query(
    `UPDATE appointments SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return res.rows[0] || null;
};

const cancelAppointment = async ({ id, reason }) => {
  const res = await query(
    `UPDATE appointments SET status = 'cancelled', cancellation_reason = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, reason]
  );
  return res.rows[0] || null;
};

module.exports = {
  create,
  listAll,
  listByStaff,
  listByStaffAndStatus,
  findById,
  setStatus,
  cancelAppointment
};
