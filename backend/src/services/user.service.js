const { ApiError } = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');
const userRepo = require('../repositories/user.repository');
const activityLogService = require('./activityLog.service');

const createAdmin = async ({ actorId, name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: 'admin',
    createdBy: actorId
  });

  await activityLogService.log({
    userId: actorId,
    action: 'CREATE_ADMIN',
    entityType: 'users',
    entityId: user.id
  });

  return user;
};

const createStaff = async ({ actorId, name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepo.createUser({
    name,
    email,
    passwordHash,
    role: 'staff',
    createdBy: actorId
  });

  await activityLogService.log({
    userId: actorId,
    action: 'CREATE_STAFF',
    entityType: 'users',
    entityId: user.id
  });

  return user;
};

const listUsers = async () => userRepo.listAll();

const getActiveStaff = async () => {
  const staff = await userRepo.findActiveStaff();
  return staff;
};

const softDeleteUser = async ({ actorId, userId }) => {
  const deleted = await userRepo.softDelete({ userId });
  if (!deleted) {
    throw new ApiError(404, 'User not found');
  }

  await activityLogService.log({
    userId: actorId,
    action: 'SOFT_DELETE_USER',
    entityType: 'users',
    entityId: userId
  });

  return deleted;
};

const resetPassword = async ({ actorId, userId, newPassword }) => {
  if (actorId === userId) {
    throw new ApiError(400, 'Use your own password change flow');
  }

  const passwordHash = await hashPassword(newPassword);
  const updated = await userRepo.updatePassword({ userId, passwordHash });
  if (!updated) {
    throw new ApiError(404, 'User not found');
  }

  await activityLogService.log({
    userId: actorId,
    action: 'RESET_PASSWORD',
    entityType: 'users',
    entityId: userId
  });

  return updated;
};

const reactivateUser = async ({ actorId, userId }) => {
  const updated = await userRepo.reactivate({ userId });
  if (!updated) {
    throw new ApiError(404, 'User not found');
  }

  await activityLogService.log({
    userId: actorId,
    action: 'REACTIVATE_USER',
    entityType: 'users',
    entityId: userId
  });

  return updated;
};

const hardDeleteUser = async ({ actorId, userId, forceDelete = false }) => {
  console.log('hardDeleteUser called with:', { actorId, userId, forceDelete });
  
  const refs = await userRepo.getReferencesCount({ userId });
  console.log('User references:', refs);
  
  // Only block deletion if user has business-critical data and forceDelete is not enabled
  // Activity logs are system-generated and shouldn't prevent deletion
  const businessRefs = refs.appointments + refs.completedWorks;

  if (businessRefs > 0 && !forceDelete) {
    throw new ApiError(
      409,
      'Cannot permanently delete user with appointments or completed works. Use force delete if necessary.',
      { appointments: refs.appointments, completedWorks: refs.completedWorks, forceDeleteAvailable: true }
    );
  }

  // If force delete, we need to handle the business data
  if (forceDelete) {
    console.log('Starting force delete cleanup...');
    try {
      // Delete business records associated with this user in a transaction
      const deletedRecords = await userRepo.nullifyUserReferences({ userId });
      console.log('Cleanup completed:', deletedRecords);
      
      // Note: We don't log the cleanup here because we're deleting the activity logs
      // The final deletion log will be created after the cleanup is complete
      
    } catch (error) {
      // Provide more detailed error information
      console.error('Force delete cleanup error:', error);
      throw new ApiError(
        500,
        'Failed to clean up user business data. The operation was rolled back.',
        { originalError: error.message, userId }
      );
    }
  }

  console.log('Attempting to delete user...');
  // Finally delete the user
  const deleted = await userRepo.hardDelete({ userId });
  if (!deleted) {
    throw new ApiError(404, 'User not found');
  }

  // Only log activity if not force delete (since we deleted all activity logs for force delete)
  if (!forceDelete) {
    await activityLogService.log({
      userId: actorId,
      action: 'HARD_DELETE_USER',
      entityType: 'users',
      entityId: userId
    });
  }

  console.log('User deletion completed successfully');
  return deleted;
};

module.exports = {
  createAdmin,
  createStaff,
  listUsers,
  getActiveStaff,
  softDeleteUser,
  reactivateUser,
  hardDeleteUser,
  resetPassword
};
