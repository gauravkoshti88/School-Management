import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Theory", "Practical", "Both"],
      default: "Theory",
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0,
      default: 33,
    },

    isCompulsory: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  },
);

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    subjects: {
      type: [subjectSchema],
      required: true,
      validate: {
        validator: (subjects) => subjects.length > 0,
        message: "At least one subject is required.",
      },
    },

    roomNumber: {
      type: String,
      trim: true,
      default: "",
    },

    capacity: {
      type: Number,
      min: 1,
      default: 40,
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

classSchema.index(
  {
    name: 1,
    section: 1,
    academicYear: 1,
  },
  {
    unique: true,
  },
);

const SchoolClass = mongoose.model("SchoolClass", classSchema);

export default SchoolClass;
