import mongoose from "mongoose";

const peonStaffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      url: {
        type: String,
        default: "",
        trim: true,
      },

      alt: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
      },
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Full Day"],
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const PeonStaff = mongoose.model("PeonStaff", peonStaffSchema);

export default PeonStaff;
