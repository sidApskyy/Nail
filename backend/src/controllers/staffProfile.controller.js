const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const staffProfileService = require('../services/staffProfile.service');

const createStaffProfile = asyncHandler(async (req, res) => {
  const profile = await staffProfileService.createStaffProfile({
    actorId: req.user.id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role || 'staff'
  });

  res.status(201).json(apiResponse({ success: true, message: 'Staff profile created', data: profile }));
});

const getActiveStaffProfiles = asyncHandler(async (req, res) => {
  const profiles = await staffProfileService.getActiveStaffProfiles();
  res.json(apiResponse({ success: true, message: 'Active staff profiles retrieved', data: profiles }));
});

const switchToStaff = asyncHandler(async (req, res) => {
  const result = await staffProfileService.switchToStaff({
    userId: req.user.id,
    staffId: req.body.staffId
  });

  res.json(apiResponse({ success: true, message: 'Switched to staff profile', data: result }));
});

const getCurrentStaff = asyncHandler(async (req, res) => {
  const currentStaff = await staffProfileService.getCurrentStaff(req.user.id);
  res.json(apiResponse({ success: true, message: 'Current staff retrieved', data: currentStaff }));
});

const deactivateStaffProfile = asyncHandler(async (req, res) => {
  const result = await staffProfileService.deactivateStaffProfile({
    actorId: req.user.id,
    staffId: req.params.id
  });

  res.json(apiResponse({ success: true, message: 'Staff profile deactivated', data: result }));
});

module.exports = {
  createStaffProfile,
  getActiveStaffProfiles,
  switchToStaff,
  getCurrentStaff,
  deactivateStaffProfile
};
