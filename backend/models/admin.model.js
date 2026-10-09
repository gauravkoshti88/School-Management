import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
