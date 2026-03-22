const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const signAccessToken = (payload) =>
  jwt.sign(payload, env.security.accessTokenSecret, {
    expiresIn: env.security.accessTokenTtl
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, env.security.refreshTokenSecret, {
    expiresIn: env.security.refreshTokenTtl
  });

const verifyAccessToken = (token) => jwt.verify(token, env.security.accessTokenSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.security.refreshTokenSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
