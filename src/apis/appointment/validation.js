const Joi = require("joi");

exports.createAppointmentSchema = Joi.object({
  doctor: Joi.string().required(),
  patient: Joi.string().optional(),

  date: Joi.date().required(),

  slot: Joi.string()
    .pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/)
    .required(),

  reason: Joi.string().allow("", null)
});

exports.getAppointmentsSchema = Joi.object({
  doctorId: Joi.string().optional(),
  status: Joi.string()
    .valid("BOOKED", "CANCELLED", "COMPLETED")
    .optional(),
  date: Joi.date().optional()
});

exports.updateAppointmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("CANCELLED", "COMPLETED")
    .required()
});