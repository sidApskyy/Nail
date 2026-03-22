const { body } = require('express-validator');

const createStaffProfileValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Staff name must be 2-100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters'),
    
  body('role')
    .optional()
    .isIn(['staff', 'senior_staff'])
    .withMessage('Role must be staff or senior_staff')
];

const switchStaffValidator = [
  body('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Invalid staff ID')
];

module.exports = {
  createStaffProfileValidator,
  switchStaffValidator
};
