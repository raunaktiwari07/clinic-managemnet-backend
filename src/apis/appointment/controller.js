
const { User, Doctor, Appointment} = require("../../models");

//CREATE APPOINTMENT

exports.createAppointment = async ({ user, body }) => {
  
    const { doctor, patient, date, slot, reason } = body;

    //   Validate doctor exists
    const doctorExists = await Doctor.findById(doctor).lean();
    if (!doctorExists) {
      return {
        statusCode: 404,
        success: false,
        message: "Doctor not found",
      };
    }
    if (!["ADMIN", "RECEPTIONIST"].includes(user.role)) {
  return {
    statusCode: 403,
    success: false,
    message: "Access denied"
  };
}

    //   Normalize date (IMPORTANT)
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const adminId =
  user.role === "ADMIN"
    ? user._id
    : user.adminId;

    //   Check slot already booked
    const existing = await Appointment.findOne({
      doctor,
      date: appointmentDate,
      slot,
      admin: adminId,
      status: "BOOKED",
    }).lean();

    if (existing) {
      return {
        statusCode: 400,
        success: false,
        message: "This time slot is already booked",
      };
    }

    //   Create appointment
    const newAppointment = await Appointment.create({
      doctor,
      patient,
      admin: adminId,
      date: appointmentDate,
      slot,
      reason,
      createdBy: user._id,
    });

    return {
      statusCode: 201,
      success: true,
      message: "Appointment created successfully",
      data: newAppointment,
    };

  };



function generateSlots(start, end, duration) {
  const slots = [];

  let [startHour, startMin] = start.split(":").map(Number);
  let [endHour, endMin] = end.split(":").map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  while (current < endTime) {
    let next = new Date(current);
    next.setMinutes(next.getMinutes() + duration);

    const format = (date) => date.toTimeString().slice(0, 5);

    slots.push(`${format(current)}-${format(next)}`);

    current = next;
  }

  return slots;
}


//AVAILABLE SLOTS 


exports.getAvailableSlots = async ({ user, query }) => {

    const { doctorId, date } = query;

    //Validate input

    if (!doctorId || !date) {
      return {
        statusCode: 400,
        success: false,
        message: "doctorId and date are required",
      };
    }

    //Get doctor
   
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return {
        statusCode: 404,
        success: false,
        message: "Doctor not found",
      };
    }

    //Normalize date

    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid date",
      };
    }
const startOfDay = new Date(date);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(date);
endOfDay.setHours(23, 59, 59, 999);

    //Generate all sLOTS
  
    const slots = generateSlots(
      doctor.workingHours.start,
      doctor.workingHours.end,
      doctor.slotDuration || 30
    );

    //Resolve admin

    const adminId =
      user.role === "ADMIN" ? user._id : user.adminId;

    //Get booked sloTS

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,

      admin: adminId,
      status: "BOOKED",
        date: {
    $gte: startOfDay,
    $lte: endOfDay,
  },
    }).lean();

    const bookedSlots = bookedAppointments.map(a => a.slot);

    //Filter availabLE
    // le
    const availableSlots = slots.filter(
      slot => !bookedSlots.includes(slot)
    );

    return {
      statusCode: 200,
      success: true,
      data: {
        totalSlots: slots,
        bookedSlots,
        availableSlots,
      },
    };

  };
  

  //Appointment




exports.getAppointments = async ({ user, query }) => {
  
    const { doctorId, date, status } = query;

    const adminId =
      user.role === "ADMIN" ? user._id : user.adminId;

    //  Build filter object
    let filter = {
      admin: adminId
    };

    if (doctorId) {
      filter.doctor = doctorId;
    }

    if (status) {
      filter.status = status;
    }

    //  Date filter (range-based like before)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    //  Fetch data
    const appointments = await Appointment.find(filter)
      .populate("doctor")
    //  .populate("patient")
      .sort({ date: 1 })
      .lean();

    return {
      statusCode: 200,
      success: true,
      data: appointments,
    };

  
};

// update appointment




exports.updateAppointmentStatus = async ({ user, params, body }) => {

    const { id } = params;
    const { status } = body;

    const adminId =
      user.role === "ADMIN" ? user._id : user.adminId;

    // Find appoint
    const appointment = await Appointment.findOne({
      _id: id,
      admin: adminId,
    });
    // if(user.role!="ADMIN"||"RECEPTIONIST"||"DOCTOR"){
    //     return{
    //         statusCode:404,
    //         success:false,
    //         message:"not allowed"
    //     }
    // }

    if (!appointment) {
      return {
        statusCode: 404,
        success: false,
        message: "Appointment not found",
      };
    }

    // Prevent invalid updates
    if (appointment.status === "CANCELLED") {
      return {
        statusCode: 400,
        success: false,
        message: "Appointment already cancelled",
      };
    }

    if (appointment.status === "COMPLETED") {
      return {
        statusCode: 400,
        success: false,
        message: "Appointment already completed",
      };
    }

    // Update statu  appointment.status = status;
   const updatedAppointment = await Appointment.findByIdAndUpdate(
  id,
  { status },
  { new: true }
);

    return {
      statusCode: 200,
      success: true,
      message: "Status updated successfully",
      data: updatedAppointment,
    };

   
};