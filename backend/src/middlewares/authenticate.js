const { ApiError } = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or invalid Authorization header'));
  }

  const token = header.substring('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role
    };
    return next();
  } catch (e) {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
};

module.exports = { authenticate };
