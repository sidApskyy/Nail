const { query } = require('../config/db');

const create = async ({ userId, tokenHash, expiresAt }) => {
  const res = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, revoked_at, created_at, expires_at`,
    [userId, tokenHash, expiresAt]
  );
  return res.rows[0];
};

const findValid = async ({ userId, tokenHash }) => {
  const res = await query(
    `SELECT * FROM refresh_tokens
     WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > NOW()`,
    [userId, tokenHash]
  );
  return res.rows[0] || null;
};

const revokeById = async ({ id }) => {
  const res = await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1 RETURNING id, revoked_at`,
    [id]
  );
  return res.rows[0] || null;
};

module.exports = { create, findValid, revokeById };
