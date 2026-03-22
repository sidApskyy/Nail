const { ApiError } = require('../utils/ApiError');
const { comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sha256 } = require('../utils/tokenHash');
const userRepo = require('../repositories/user.repository');
const refreshRepo = require('../repositories/refreshToken.repository');

const parseJwtExpiryToDate = (secondsFromNow) => new Date(Date.now() + secondsFromNow * 1000);

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = parseJwtExpiryToDate(decoded.exp - decoded.iat);

  await refreshRepo.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

const refresh = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Missing refresh token');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const userId = payload.sub;
  const tokenHash = sha256(refreshToken);

  const user = await userRepo.findById(userId);
  if (!user || !user.is_active) {
    throw new ApiError(401, 'User inactive');
  }

  const stored = await refreshRepo.findValid({ userId, tokenHash });
  if (!stored) {
    throw new ApiError(401, 'Refresh token revoked');
  }

  await refreshRepo.revokeById({ id: stored.id });

  const newAccessToken = signAccessToken({ sub: userId, role: payload.role });
  const newRefreshToken = signRefreshToken({ sub: userId, role: payload.role });

  const decoded = verifyRefreshToken(newRefreshToken);
  const expiresAt = parseJwtExpiryToDate(decoded.exp - decoded.iat);

  await refreshRepo.create({
    userId,
    tokenHash: sha256(newRefreshToken),
    expiresAt
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

module.exports = { login, refresh };
