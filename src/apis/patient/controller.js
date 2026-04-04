const bcrypt = require("bcryptjs");
const { User, Patient} = require("../../models");
const { generatePassword } = require("../../utils/otpServices");
const jwt = require("jsonwebtoken");





// login patient 



exports.loginPatient = async ({ body }) => {
  const { phone } = body;

  if (!phone) {
    return {
      statusCode: 400,
      success: false,
      message: "Phone is required",
    };
  }

  let user = await User.findOne({ phone });

  //  If not exist → create user
  if (!user) {
    user = await User.create({
      phone,
      role: "PATIENT",
      isActive: true,
      lastLogin: new Date(),
    });
  }

  //  Generate token
  const token = jwt.sign(
    {
      _id: user._id,
      phone: user.phone,
      role: user.role,
      adminId: user.adminId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: { token },
  };
};




//create patient






exports.createPatient = async ({ user, body }) => {
  const {
    name,
    phone,
    age,
    gender,
    bloodGroup,
    relation = "SELF",
    otherRelation,
    diseases,
    allergies,
    medicalHistory,
  } = body;

  let finalPhone;
 let patientUserId = user._id;

  //  Role-based phone logic
  if (user.role === "PATIENT") {
    finalPhone = user.phone;
  } else {
    if (!phone) {
      return {
        statusCode: 400,
        success: false,
        message: "Phone is required",
      };
    }
    finalPhone = phone;
  }

  //  Name validation
  if (!name) {
    return {
      statusCode: 400,
      success: false,
      message: "Name is required",
    };
  }

  //  SELF restriction (only one per user per clinic)
  console.log("patient",Patient,User)
  if (relation === "SELF") {
    const existingSelf = await Patient.findOne({
      user: patientUserId,
      relation: "SELF",
      admin: user.adminId,
    });

    if (existingSelf) {
      return {
        statusCode: 400,
        success: false,
        message: "SELF patient already exists",
      };
    }
  }

  //  OTHER validation
  if (relation === "OTHER" && (!otherRelation || !otherRelation.trim())) {
    return {
      statusCode: 400,
      success: false,
      message: "otherRelation is required when relation is OTHER",
    };
  }



  if (relation === "SELF" && user.role !== "PATIENT") {
    // Admin creating patient → create new user
    const existingUser = await User.findOne({ phone: finalPhone });

    if (existingUser) {
      return {
        statusCode: 400,
        success: false,
        message: "User with this phone already exists",
      };
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const newUser = await User.create({
      name,
      phone: finalPhone,
      password: hashedPassword,
      role: "PATIENT",
      isActive: true,
      lastLogin: new Date(),
    });

 patientUserId = newUser._id;

    // attach password in response later
    body.generatedPassword = rawPassword;
  }

  //  Create patient
  const patient = await Patient.create({
    user: patientUserId,
    admin: user.adminId,
    phone: finalPhone,
    name,
    age,
    gender,
    bloodGroup,
    relation,
    otherRelation,
    diseases,
    allergies,
    medicalHistory,
  });

  if (!patient) {
    return {
      statusCode: 500,
      success: false,
      message: "Failed to create patient",
    };
  }

  return {
    statusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: {
      ...patient.toObject(),
      ...(body.generatedPassword && {
        password: body.generatedPassword,
      }),
    },
  };
};