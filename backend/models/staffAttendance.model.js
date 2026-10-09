import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "staffModel",
    },

    staffModel: {
      type: String,
      required: true,
      enum: ["Teacher", "PeonStaff", "LibraryStaff"],
    },

    staffType: {
      type: String,
      required: true,
      enum: ["teacher", "peon", "library"],
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["present", "absent", "late", "leave"],
      default: "present",
    },

    checkIn: {
      type: String,
      default: "",
      trim: true,
    },

    checkOut: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

staffAttendanceSchema.index(
  {
    staffId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

const StaffAttendance = mongoose.model(
  "StaffAttendance",
  staffAttendanceSchema,
);

export default StaffAttendance;
