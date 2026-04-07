const express = require('express');

const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const { getCurrentStaff } = require('../middlewares/getCurrentStaff');
const { upload, uploadOptional } = require('../middlewares/upload');
const { createAppointmentValidator, uploadWorkValidator, cancelAppointmentValidator } = require('../validators/staff.validators');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['staff']));
router.use(getCurrentStaff);

router.post('/appointments', createAppointmentValidator, validate, staffController.createAppointment);
router.get('/my-appointments', staffController.myAppointments);

router.post(
  '/upload-work',
  uploadOptional,
  uploadWorkValidator,
  validate,
  staffController.uploadWork
);

router.post('/cancel-appointment', cancelAppointmentValidator, validate, staffController.cancelAppointment);

module.exports = router;
