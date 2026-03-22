const { ApiError } = require('../utils/ApiError');
const { apiResponse } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  const payload = apiResponse({
    success: false,
    message: err.message || 'Internal Server Error',
    data: err.details || null
  });

  res.status(statusCode).json(payload);
};

module.exports = { errorHandler };
