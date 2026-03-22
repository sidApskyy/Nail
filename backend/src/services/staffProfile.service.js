const { ApiError } = require('../utils/ApiError');
const staffProfileRepo = require('../repositories/staffProfile.repository');
const userRepo = require('../repositories/user.repository');
const activityLogService = require('./activityLog.service');

const createStaffProfile = async ({ actorId, name, email, phone, role }) => {
  // Check if email already exists in staff profiles
  const existing = await staffProfileRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Staff profile with this email already exists');
  }

  const profile = await staffProfileRepo.create({
    name,
    email,
    phone,
    role: role || 'staff',
    createdBy: actorId
  });

  await activityLogService.log({
    userId: actorId,
    action: 'CREATE_STAFF_PROFILE',
    entityType: 'staff_profiles',
    entityId: profile.id
  });

  return profile;
};

const getActiveStaffProfiles = async () => {
  const profiles = await staffProfileRepo.findActive();
  return profiles;
};

const switchToStaff = async ({ userId, staffId }) => {
  // Verify staff profile exists and is active
  const staffProfile = await staffProfileRepo.findById(staffId);
  if (!staffProfile) {
    throw new ApiError(404, 'Staff profile not found');
  }

  if (!staffProfile.is_active) {
    throw new ApiError(403, 'Staff profile is not active');
  }

  // Update user's current staff profile
  await userRepo.updateCurrentStaff({ userId, staffId });

  await activityLogService.log({
    userId,
    action: 'SWITCH_STAFF_PROFILE',
    entityType: 'staff_profiles',
    entityId: staffId
  });

  return {
    currentStaffId: staffId,
    staffName: staffProfile.name,
    staffEmail: staffProfile.email
  };
};

const getCurrentStaff = async (userId) => {
  const currentStaff = await staffProfileRepo.findCurrentStaff(userId);
  return currentStaff;
};

const deactivateStaffProfile = async ({ actorId, staffId }) => {
  const deactivated = await staffProfileRepo.deactivate(staffId);
  if (!deactivated) {
    throw new ApiError(404, 'Staff profile not found');
  }

  // Remove this staff from any users currently using it
  await userRepo.clearCurrentStaff(staffId);

  await activityLogService.log({
    userId: actorId,
    action: 'DEACTIVATE_STAFF_PROFILE',
    entityType: 'staff_profiles',
    entityId: staffId
  });

  return deactivated;
};

module.exports = {
  createStaffProfile,
  getActiveStaffProfiles,
  switchToStaff,
  getCurrentStaff,
  deactivateStaffProfile
};
