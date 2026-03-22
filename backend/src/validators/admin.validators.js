const { body, param } = require('express-validator');

const createUserBase = [
  body('name').isString().isLength({ min: 2, max: 120 }).trim(),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').trim().isString().isLength({ min: 8, max: 128 })
];

const softDeleteUserValidator = [param('id').isUUID()];
const activateUserValidator = [param('id').isUUID()];
const hardDeleteUserValidator = [param('id').isUUID()];
const resetPasswordValidator = [
  param('id').isUUID(),
  body('password').trim().isString().isLength({ min: 8, max: 128 })
];

module.exports = {
  createUserBase,
  softDeleteUserValidator,
  activateUserValidator,
  hardDeleteUserValidator,
  resetPasswordValidator
};
