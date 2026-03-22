const { ApiError } = require('../utils/ApiError');
const appointmentRepo = require('../repositories/appointment.repository');
const activityLogService = require('./activityLog.service');
const { query } = require('../config/db');

const createAppointment = async ({ actorId, actorName, customerName, customerPhone, appointmentDate, appointmentTime }) => {
  const appt = await appointmentRepo.create({
    customerName,
    customerPhone,
    appointmentDate,
    appointmentTime,
    createdBy: actorId,
    createdByName: actorName
  });

  await activityLogService.log({
    userId: actorId,
    action: 'CREATE_APPOINTMENT',
    entityType: 'appointments',
    entityId: appt.id
  });

  return appt;
};

const listAllAppointments = async () => appointmentRepo.listAll();

const listMyAppointments = async ({ actorId, status }) => {
  if (status) {
    return appointmentRepo.listByStaffAndStatus({ staffId: actorId, status });
  }
  return appointmentRepo.listByStaff({ staffId: actorId });
};

const assertOwnershipForStaff = async ({ actorId, appointmentId }) => {
  const appt = await appointmentRepo.findById({ id: appointmentId });
  if (!appt) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (appt.created_by !== actorId) {
    throw new ApiError(403, 'Forbidden');
  }

  return appt;
};

const cancelAppointment = async ({ actorId, appointmentId, reason }) => {
  const appt = await assertOwnershipForStaff({ actorId, appointmentId });
  if (appt.status !== 'pending') {
    throw new ApiError(400, 'Only pending appointments can be cancelled');
  }

  const updated = await appointmentRepo.cancelAppointment({ id: appointmentId, reason });

  await activityLogService.log({
    userId: actorId,
    action: 'CANCEL_APPOINTMENT',
    entityType: 'appointments',
    entityId: appointmentId
  });

  return updated;
};

const clearAllAppointments = async () => {
  try {
    console.log('Getting count before delete...');
    const countRes = await query('SELECT COUNT(*) FROM appointments', []);
    const count = parseInt(countRes.rows[0].count);
    
    console.log(`Deleting ${count} appointments...`);
    await query('DELETE FROM appointments', []);
    
    console.log(`Successfully deleted ${count} appointments`);
    return count;
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

module.exports = {
  createAppointment,
  listAllAppointments,
  listMyAppointments,
  assertOwnershipForStaff,
  cancelAppointment,
  clearAllAppointments
};
