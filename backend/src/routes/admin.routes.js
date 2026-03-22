const express = require('express');

const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const {
  createUserBase,
  softDeleteUserValidator,
  activateUserValidator,
  hardDeleteUserValidator,
  resetPasswordValidator
} = require('../validators/admin.validators');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.post('/create-admin', createUserBase, validate, adminController.createAdmin);
router.post('/create-staff', createUserBase, validate, adminController.createStaff);
router.get('/active-staff', adminController.getActiveStaff);

router.get('/users', adminController.listUsers);
router.delete('/users/:id', softDeleteUserValidator, validate, adminController.deleteUser);
router.delete('/users/:id/permanent', hardDeleteUserValidator, validate, adminController.hardDeleteUser);
router.delete('/users/:id/force', hardDeleteUserValidator, validate, adminController.forceDeleteUser);
router.patch('/users/:id/activate', activateUserValidator, validate, adminController.reactivateUser);
router.patch('/users/:id/reset-password', resetPasswordValidator, validate, adminController.resetUserPassword);

router.get('/appointments', adminController.listAppointments);
router.get('/appointments/export', adminController.exportAppointments);
router.delete('/appointments/clear', adminController.clearAppointments);

// STRICT RULE: staff must NEVER access completed works list. This route is admin-only.
router.get('/completed-works', adminController.listCompletedWorks);
router.get('/completed-works/export', adminController.exportCompletedWorks);
router.delete('/completed-works/clear', adminController.clearCompletedWorks);

router.get('/dashboard-stats', adminController.dashboardStats);
router.get('/activity-logs', adminController.activityLogs);

module.exports = router;
