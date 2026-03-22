const express = require('express');

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const staffRoutes = require('./staff.routes');
const staffProfileRoutes = require('./staffProfile.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/staff-profiles', staffProfileRoutes);
router.use('/admin/analytics', analyticsRoutes);

module.exports = router;
