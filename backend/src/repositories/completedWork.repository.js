const { query } = require('../config/db');

const create = async ({ appointmentId, customerName, customerPhone, name, number, amount, discountPercentage, discountAmount, total, description, imageUrl, uploadedBy, uploadedByName }) => {
  // Provide default value for imageUrl if null to satisfy NOT NULL constraint
  const finalImageUrl = imageUrl || '/uploads/default-work-image.jpg';
  
  const res = await query(
    `INSERT INTO completed_works (appointment_id, customer_name, customer_phone, name, number, amount, discount_percentage, discount_amount, total, description, image_url, uploaded_by, uploaded_by_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [appointmentId, customerName, customerPhone, name, number, amount || null, discountPercentage || 0, discountAmount || 0, total || 0, description || null, finalImageUrl, uploadedBy, uploadedByName]
  );
  return res.rows[0];
};

const listAll = async () => {
  const res = await query(
    `SELECT cw.*, 
            COALESCE(cw.uploaded_by_name, u.name, 'Unknown') AS uploaded_by_name,
            u.email AS uploaded_by_email
     FROM completed_works cw
     LEFT JOIN users u ON u.id = cw.uploaded_by
     ORDER BY cw.created_at DESC`,
    []
  );
  return res.rows;
};

module.exports = { create, listAll };
