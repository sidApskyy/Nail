const { ApiError } = require('../utils/ApiError');

const authorize = (roles = []) => {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (!allowed.has(req.user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }

    return next();
  };
};

module.exports = { authorize };
