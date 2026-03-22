const express = require('express');
const router = express.Router();

const { getStaffSales, getStaffDetailedSales, getSalesData } = require('../controllers/analytics.controller');

// Staff sales data
router.get('/staff-sales', getStaffSales);

// Detailed staff sales data
router.get('/staff-sales/:staffId', getStaffDetailedSales);

// Time-based sales data (day/week/month)
router.get('/sales', getSalesData);

module.exports = router;
