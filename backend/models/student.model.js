import mongoose from "mongoose";

const libraryBookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    issueDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    returnedDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["issued", "returned"],
      default: "issued",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const studentSchema = new mongoose.Schema(
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

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    motherName: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    libraryBooks: {
      type: [libraryBookSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

studentSchema.index(
  {
    classId: 1,
    rollNumber: 1,
  },
  {
    unique: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
