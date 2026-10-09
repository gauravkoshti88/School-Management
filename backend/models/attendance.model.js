import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index(
  {
    studentId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

attendanceSchema.index({
  classId: 1,
  date: 1,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
