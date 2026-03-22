const { body } = require('express-validator');

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').trim().isString().isLength({ min: 6, max: 128 })
];

module.exports = { loginValidator };
