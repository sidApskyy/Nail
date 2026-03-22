const express = require('express');
const staffProfileController = require('../controllers/staffProfile.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const {
  createStaffProfileValidator,
  switchStaffValidator
} = require('../validators/staffProfile.validators');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);

// Admin-only routes
router.post('/create', authorize(['admin']), createStaffProfileValidator, validate, staffProfileController.createStaffProfile);
router.get('/active', authorize(['admin', 'staff']), staffProfileController.getActiveStaffProfiles);
router.delete('/:id/deactivate', authorize(['admin']), staffProfileController.deactivateStaffProfile);

// Staff routes (for switching)
router.post('/switch', authorize(['admin', 'staff']), switchStaffValidator, validate, staffProfileController.switchToStaff);
router.get('/current', authorize(['admin', 'staff']), staffProfileController.getCurrentStaff);

module.exports = router;
