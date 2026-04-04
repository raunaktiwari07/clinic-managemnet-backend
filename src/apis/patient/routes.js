const express = require("express");
const router = express.Router();
const{} = require("./validation");
const { protect, authorize, validate } = require("../../middlewares");

const {createPatient, loginPatient} = require("./controller");
const responseHandler = require("../../utils/responseHandler");

router.post(
    "/create-patient",
    protect,
    authorize("ADMIN","RECEPTIONIST","PATIENT"),
    responseHandler(createPatient)
)

router.post(
    "/login",
  
    responseHandler(loginPatient)
)

module.exports = router;