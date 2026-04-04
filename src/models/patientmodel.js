import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true
        },
    
        // Multi-tenant (Clinic reference)
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
          index: true
        },

   //  Grouping (same mobile = same family)
    phone: {
      type: String,
      required: true,
      index: true,
        trim: true,
    },

    //  Patient identity (IMPORTANT - do NOT remove)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: Number,

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    lastLogin: {
      type: Date,
    },

    relation: {
      type: String,
      enum: ["SELF", "FATHER", "MOTHER", "CHILD", "SPOUSE", "OTHER"], /// other field needed
      default: "SELF",
    },

    otherRelation: {
      type: String,
      default: null,
        trim: true,
    },

      //  Medical Info

    diseases: {
      type: [String],
      default: [],
    },

    allergies: {
      type: [String],
      default: [],
    },

    medicalHistory: {
      type: String,
      default: "",
    },



    //  Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },


    // relationId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Patient", // patient id make
    //     default: null,  // when patient is self in realtion

    // }, //condition -- relatopn mai self select hai to realtion id can be null -- default 

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
        //  Activity
   
  },
  {
    timestamps: true,
  
  },
  
);
patientSchema.index({ phone: 1, admin: 1 });
//in validation other is coming in relation it can't be empty and null or else self and father and mother do not write anything 
patientSchema.pre("save", function (next) {
  if (this.relation === "OTHER") {
    if (!this.otherRelation || this.otherRelation.trim() === "") {
      return next(new Error("otherRelation is required when relation is OTHER"));
    }
  } else {
    this.otherRelation = null; // clean unwanted data
  }

  next();
});
export default mongoose.model("Patient", patientSchema);