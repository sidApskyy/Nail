const { ApiError } = require('../utils/ApiError');
const completedRepo = require('../repositories/completedWork.repository');
const appointmentRepo = require('../repositories/appointment.repository');
const activityLogService = require('./activityLog.service');
const { query } = require('../config/db');

const uploadWork = async ({
  actorId,
  actorName,
  appointmentId,
  name,
  number,
  amount,
  discountPercentage,
  discountAmount,
  total,
  description,
  imageUrl
}) => {
  const appt = await appointmentRepo.findById({ id: appointmentId });
  if (!appt) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (appt.created_by !== actorId) {
    throw new ApiError(403, 'You can only upload work for your own appointments');
  }

  if (appt.status === 'completed') {
    throw new ApiError(409, 'Appointment already completed');
  }

  const work = await completedRepo.create({
    appointmentId,
    customerName: appt.customer_name,
    customerPhone: appt.customer_phone,
    name,
    number,
    amount,
    discountPercentage,
    discountAmount,
    total,
    description,
    imageUrl,
    uploadedBy: actorId,
    uploadedByName: actorName
  });

  await appointmentRepo.setStatus({ id: appointmentId, status: 'completed' });

  await activityLogService.log({
    userId: actorId,
    action: 'UPLOAD_COMPLETED_WORK',
    entityType: 'completed_works',
    entityId: work.id
  });

  return work;
};

const listAllCompletedWorks = async () => completedRepo.listAll();

const exportCompletedWorks = async () => {
  const works = await completedRepo.listAll();
  
  // Transform data for Excel export
  const exportData = works.map(work => ({
    'Customer Name': work.customer_name,
    'Customer Phone': work.customer_phone,
    'Work Description': work.description,
    'Amount': work.amount || 0,
    'Discount Percentage': work.discount_percentage || 0,
    'Discount Amount': work.discount_amount || 0,
    'Total': work.total || 0,
    'Staff Name': work.uploaded_by_name,
    'Date': new Date(work.created_at).toLocaleDateString(),
    'Time': new Date(work.created_at).toLocaleTimeString()
  }));
  
  return exportData;
};

const clearAllCompletedWorks = async () => {
  try {
    console.log('Getting count before delete...');
    const countRes = await query('SELECT COUNT(*) FROM completed_works', []);
    const count = parseInt(countRes.rows[0].count);
    
    console.log(`Deleting ${count} completed works...`);
    await query('DELETE FROM completed_works', []);
    
    console.log(`Successfully deleted ${count} completed works`);
    return count;
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

module.exports = { 
  uploadWork, 
  listAllCompletedWorks, 
  exportCompletedWorks, 
  clearAllCompletedWorks 
};
