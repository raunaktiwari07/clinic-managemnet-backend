const express = require("express");
const router = express.Router();
const {createAppointmentSchema,getAppointmentsSchema,updateAppointmentStatusSchema  } = require("./validation");
const { protect, authorize, validate } = require("../../middlewares");
const {createAppointment,getAvailableSlots,getAppointments,updateAppointmentStatus} = require("./controller");
const responseHandler = require("../../utils/responseHandler");
console.log("validate", validate,authorize);


router.post(
    "/create-appointment",
    protect,
    validate(createAppointmentSchema),
    authorize("ADMIN","RECEPTIONIST"),
    responseHandler(createAppointment)

);

router.get(
    "/available-slots",
    protect,
   
    authorize("ADMIN","RECEPTIONIST"),
    responseHandler(getAvailableSlots)
)
router.get(
  "/appointments",
  protect,
  validate(getAppointmentsSchema ),
  authorize("ADMIN", "RECEPTIONIST","DOCTOR"),
  responseHandler(getAppointments)
);
router.put(
  "/:id/status",
  protect,
  validate(updateAppointmentStatusSchema  ),
  authorize("ADMIN", "RECEPTIONIST","DOCTOR"),
  responseHandler(updateAppointmentStatus)
);




module.exports = router;