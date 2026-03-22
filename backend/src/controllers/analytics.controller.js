const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');
const analyticsService = require('../services/analytics.service');

const getStaffSales = asyncHandler(async (req, res) => {
  const staffSales = await analyticsService.getStaffSales();
  res.json(apiResponse({ 
    success: true, 
    message: 'Staff sales data retrieved', 
    data: staffSales 
  }));
});

const getStaffDetailedSales = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const detailedSales = await analyticsService.getStaffDetailedSales(staffId);
  res.json(apiResponse({ 
    success: true, 
    message: 'Staff detailed sales data retrieved', 
    data: detailedSales 
  }));
});

const getSalesData = asyncHandler(async (req, res) => {
  const { range } = req.query;
  
  let salesData;
  switch (range) {
    case 'day':
      salesData = await analyticsService.getDailySales();
      break;
    case 'week':
      salesData = await analyticsService.getWeeklySales();
      break;
    case 'month':
    default:
      salesData = await analyticsService.getMonthlySales();
      break;
  }
  
  res.json(apiResponse({ 
    success: true, 
    message: `${range} sales data retrieved`, 
    data: salesData 
  }));
});

module.exports = {
  getStaffSales,
  getStaffDetailedSales,
  getSalesData
};
