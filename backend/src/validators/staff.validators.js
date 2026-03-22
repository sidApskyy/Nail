const { body } = require('express-validator');

const createAppointmentValidator = [
  body('customer_name').isString().isLength({ min: 2, max: 120 }).trim(),
  body('customer_phone').isString().isLength({ min: 6, max: 30 }).trim(),
  body('appointment_date').isISO8601().toDate(),
  body('appointment_time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
];

const uploadWorkValidator = [
  body('appointment_id').isUUID(),
  body('name').isString().isLength({ min: 2, max: 120 }).trim(),
  body('number').isString().isLength({ min: 1, max: 30 }).trim(),
  body('products_used').optional().isString().isLength({ max: 5000 }),
  body('cost').optional().isString().isLength({ min: 1, max: 30 }).trim()
];

const cancelAppointmentValidator = [
  body('appointment_id').isUUID(),
  body('reason').isString().isLength({ min: 2, max: 500 }).trim()
];

module.exports = { createAppointmentValidator, uploadWorkValidator, cancelAppointmentValidator };
