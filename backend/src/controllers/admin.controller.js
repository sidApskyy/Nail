const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/user.service');
const appointmentService = require('../services/appointment.service');
const completedWorkService = require('../services/completedWork.service');
const dashboardService = require('../services/dashboard.service');
const activityLogService = require('../services/activityLog.service');
const XLSX = require('xlsx');

const createAdmin = asyncHandler(async (req, res) => {
  const user = await userService.createAdmin({
    actorId: req.user.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  res.status(201).json(apiResponse({ success: true, message: 'Admin created', data: user }));
});

const createStaff = asyncHandler(async (req, res) => {
  const staff = await userService.createStaff({
    actorId: req.user.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  res.status(201).json(apiResponse({ success: true, message: 'Staff created', data: staff }));
});

const getActiveStaff = asyncHandler(async (req, res) => {
  const staff = await userService.getActiveStaff();
  res.json(apiResponse({ success: true, message: 'Active staff retrieved', data: staff }));
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json(apiResponse({ success: true, message: 'OK', data: users }));
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.softDeleteUser({ actorId: req.user.id, userId: req.params.id });
  res.json(apiResponse({ success: true, message: 'User deactivated', data: result }));
});

const reactivateUser = asyncHandler(async (req, res) => {
  const result = await userService.reactivateUser({ actorId: req.user.id, userId: req.params.id });
  res.json(apiResponse({ success: true, message: 'User activated', data: result }));
});

const hardDeleteUser = asyncHandler(async (req, res) => {
  const result = await userService.hardDeleteUser({ actorId: req.user.id, userId: req.params.id });
  res.json(apiResponse({ success: true, message: 'User permanently deleted', data: result }));
});

const forceDeleteUser = asyncHandler(async (req, res) => {
  console.log('Force delete request for user:', req.params.id);
  console.log('Actor ID:', req.user.id);
  
  try {
    const result = await userService.hardDeleteUser({ 
      actorId: req.user.id, 
      userId: req.params.id, 
      forceDelete: true 
    });
    console.log('Force delete successful:', result);
    res.json(apiResponse({ success: true, message: 'User force deleted with data cleanup', data: result }));
  } catch (error) {
    console.error('Force delete error:', error);
    throw error;
  }
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const result = await userService.resetPassword({
    actorId: req.user.id,
    userId: req.params.id,
    newPassword: req.body.password
  });
  res.json(apiResponse({ success: true, message: 'Password reset', data: result }));
});

const listAppointments = asyncHandler(async (req, res) => {
  const appts = await appointmentService.listAllAppointments();
  res.json(apiResponse({ success: true, message: 'OK', data: appts }));
});

const listCompletedWorks = asyncHandler(async (req, res) => {
  const works = await completedWorkService.listAllCompletedWorks();
  res.json(apiResponse({ success: true, message: 'OK', data: works }));
});

const dashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json(apiResponse({ success: true, message: 'OK', data: stats }));
});

const activityLogs = asyncHandler(async (req, res) => {
  const logs = await activityLogService.listAll();
  res.json(apiResponse({ success: true, message: 'OK', data: logs }));
});

const exportCompletedWorks = asyncHandler(async (req, res) => {
  const exportData = await completedWorkService.exportCompletedWorks();
  
  // Create Excel workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Completed Works');
  
  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  // Set headers for download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=completed-works-${new Date().toISOString().split('T')[0]}.xlsx`);
  
  res.send(excelBuffer);
});

const exportAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.listAllAppointments();
  
  // Transform data for Excel export
  const exportData = appointments.map(apt => ({
    'Customer Name': apt.customer_name,
    'Customer Phone': apt.customer_phone,
    'Staff Name': apt.staff_name,
    'Date': new Date(apt.appointment_date).toLocaleDateString(),
    'Time': new Date(apt.appointment_date).toLocaleTimeString(),
    'Status': apt.status,
    'Notes': apt.notes || ''
  }));
  
  // Create Excel workbook
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
  
  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  // Set headers for download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=appointments-${new Date().toISOString().split('T')[0]}.xlsx`);
  
  res.send(excelBuffer);
});

const clearCompletedWorks = asyncHandler(async (req, res) => {
  try {
    console.log('Attempting to clear completed works...');
    const deletedCount = await completedWorkService.clearAllCompletedWorks();
    console.log(`Successfully cleared ${deletedCount} completed works`);
    res.json(apiResponse({ 
      success: true, 
      message: `${deletedCount} completed works cleared from database`, 
      data: { deletedCount } 
    }));
  } catch (error) {
    console.error('Error clearing completed works:', error);
    throw error;
  }
});

const clearAppointments = asyncHandler(async (req, res) => {
  try {
    console.log('Attempting to clear appointments...');
    const deletedCount = await appointmentService.clearAllAppointments();
    console.log(`Successfully cleared ${deletedCount} appointments`);
    res.json(apiResponse({ 
      success: true, 
      message: `${deletedCount} appointments cleared from database`, 
      data: { deletedCount } 
    }));
  } catch (error) {
    console.error('Error clearing appointments:', error);
    throw error;
  }
});

module.exports = {
  createAdmin,
  createStaff,
  getActiveStaff,
  listUsers,
  deleteUser,
  reactivateUser,
  hardDeleteUser,
  forceDeleteUser,
  resetUserPassword,
  listAppointments,
  listCompletedWorks,
  dashboardStats,
  activityLogs,
  exportCompletedWorks,
  clearCompletedWorks,
  exportAppointments,
  clearAppointments
};
