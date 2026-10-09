import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/admin.model.js";

import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";

const generateAdminToken = (adminId) => {
  return jwt.sign(
    {
      adminId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = generateAdminToken(admin._id.toString());

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        username: admin.username,
        profileImage: admin.profileImage || {
          publicId: "",
          url: "",
          alt: "",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password -__v");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update logged-in admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const { fullname, username, password } = req.body;

    if (fullname !== undefined) {
      const trimmedFullname = fullname.trim();

      if (!trimmedFullname) {
        return res.status(400).json({
          success: false,
          message: "Full name is required",
        });
      }

      admin.fullname = trimmedFullname;
    }

    if (username !== undefined) {
      const trimmedUsername = username.trim();

      if (!trimmedUsername) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }

      const existingAdmin = await Admin.findOne({
        username: trimmedUsername,
        _id: {
          $ne: admin._id,
        },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          code: "DUPLICATE_FIELD",
          field: "username",
          message: "This username is already in use",
        });
      }

      admin.username = trimmedUsername;
    }

    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    const updatedAdmin = await Admin.findById(admin._id).select(
      "-password -__v",
    );

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_FIELD",
        field: "username",
        message: "This username is already in use",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update admin profile",
    });
  }
};

// Upload or update admin profile image
export const uploadAdminProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const oldPublicId = admin.profileImage?.publicId || "";

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "school-management/admin",
    );

    admin.profileImage = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      alt: req.body.alt?.trim() || `${admin.fullname} profile image`,
    };

    await admin.save();

    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    const updatedAdmin = await Admin.findById(admin._id).select(
      "-password -__v",
    );

    return res.status(200).json({
      success: true,
      message: "Admin profile image updated successfully",
      admin: updatedAdmin,
      profileImage: updatedAdmin.profileImage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to upload admin profile image",
    });
  }
};

// Remove admin profile image
export const deleteAdminProfileImage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const publicId = admin.profileImage?.publicId || "";

    admin.profileImage = {
      publicId: "",
      url: "",
      alt: "",
    };

    await admin.save();

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    const updatedAdmin = await Admin.findById(admin._id).select(
      "-password -__v",
    );

    return res.status(200).json({
      success: true,
      message: "Admin profile image removed successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove admin profile image",
    });
  }
};
