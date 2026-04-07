const path = require('path');
const { env } = require('../config/env');
const { apiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const appointmentService = require('../services/appointment.service');
const completedWorkService = require('../services/completedWork.service');

const createAppointment = asyncHandler(async (req, res) => {
  const appt = await appointmentService.createAppointment({
    actorId: req.effectiveUser.id,
    actorName: req.effectiveUser.name,
    customerName: req.body.customer_name,
    customerPhone: req.body.customer_phone,
    appointmentDate: req.body.appointment_date,
    appointmentTime: req.body.appointment_time
  });

  res.status(201).json(apiResponse({ success: true, message: 'Appointment created', data: appt }));
});

const myAppointments = asyncHandler(async (req, res) => {
  const appts = await appointmentService.listMyAppointments({ 
    actorId: req.effectiveUser.id, 
    status: 'pending' 
  });
  res.json(apiResponse({ success: true, message: 'OK', data: appts }));
});

const uploadWork = asyncHandler(async (req, res) => {
  // Make image optional - only set imageUrl if file exists
  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${path.basename(req.file.path)}`;
  }

  const work = await completedWorkService.uploadWork({
    actorId: req.effectiveUser.id,
    actorName: req.effectiveUser.name,
    appointmentId: req.body.appointment_id,
    name: req.body.name,
    number: req.body.number,
    amount: req.body.amount,
    discountPercentage: req.body.discount_percentage,
    discountAmount: req.body.discount_amount,
    total: req.body.total,
    description: req.body.description,
    imageUrl
  });

  res.status(201).json(apiResponse({ success: true, message: 'Work uploaded', data: work }));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const cancelled = await appointmentService.cancelAppointment({
    actorId: req.user.id,
    appointmentId: req.body.appointment_id,
    reason: req.body.reason
  });

  res.json(apiResponse({ success: true, message: 'Appointment cancelled', data: cancelled }));
});

module.exports = { createAppointment, myAppointments, uploadWork, cancelAppointment };
