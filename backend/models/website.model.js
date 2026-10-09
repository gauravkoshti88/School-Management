import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
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
  {
    _id: false,
  },
);

const websiteSchema = new mongoose.Schema(
  {
    websiteName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    favicon: {
      type: imageSchema,
      default: () => ({}),
    },

    lightLogo: {
      type: imageSchema,
      default: () => ({}),
    },

    darkLogo: {
      type: imageSchema,
      default: () => ({}),
    },

    mainPoster: {
      type: imageSchema,
      default: () => ({}),
    },

    about: {
      title: {
        type: String,
        default: "",
        trim: true,
        maxlength: 150,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 3000,
      },

      image: {
        type: imageSchema,
        default: () => ({}),
      },
    },

    contact: {
      phone: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
        maxlength: 150,
      },

      address: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      mapUrl: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      whatsapp: {
        type: String,
        default: "",
        trim: true,
        maxlength: 30,
      },
    },

    socialLinks: {
      facebook: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      instagram: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      youtube: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      twitter: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Website = mongoose.model("Website", websiteSchema);

export default Website;
