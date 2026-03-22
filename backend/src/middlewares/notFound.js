const { apiResponse } = require('../utils/apiResponse');

const notFound = (req, res) => {
  res.status(404).json(
    apiResponse({
      success: false,
      message: 'Route not found',
      data: null
    })
  );
};

module.exports = { notFound };
