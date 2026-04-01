
const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    index: true
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  slot: {
    type: String, // "10:00-10:30"
    required: true
  },


  status: {
    type: String,
    enum: ["BOOKED", "CANCELLED", "COMPLETED"],
    default: "BOOKED",
    index: true
  },

  reason: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},


{ timestamps: true });

  appointmentSchema.index(
  { doctor: 1, date: 1, slot: 1, admin:1 },
  { unique: true }
);


module.exports = mongoose.model("Appointment", appointmentSchema);