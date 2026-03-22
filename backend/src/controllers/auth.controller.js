const { env } = require('../config/env');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.cookie(env.security.refreshCookieName, result.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/api/auth/refresh-token'
  });

  res.json(
    apiResponse({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    })
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies[env.security.refreshCookieName] || req.body.refresh_token;
  const result = await authService.refresh({ refreshToken: token });

  res.cookie(env.security.refreshCookieName, result.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/api/auth/refresh-token'
  });

  res.json(
    apiResponse({
      success: true,
      message: 'Token refreshed',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    })
  );
});

module.exports = { login, refreshToken };
