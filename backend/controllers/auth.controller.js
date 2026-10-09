import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Teacher from "../models/teacher.model.js";
import PeonStaff from "../models/peonStaff.model.js";
import LibraryStaff from "../models/libraryStaff.model.js";

const generateStaffToken = (staffId, staffType) => {
  return jwt.sign(
    {
      staffId,
      staffType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let staff = null;
    let staffType = null;

    const teacher = await Teacher.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (teacher) {
      staff = teacher;
      staffType = "teacher";
    }

    if (!staff) {
      const peon = await PeonStaff.findOne({
        email: normalizedEmail,
      }).select("+password");

      if (peon) {
        staff = peon;
        staffType = "peon";
      }
    }

    if (!staff) {
      const libraryStaff = await LibraryStaff.findOne({
        email: normalizedEmail,
      }).select("+password");

      if (libraryStaff) {
        staff = libraryStaff;
        staffType = "library";
      }
    }

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (staff.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your staff account is inactive.",
      });
    }

    if (!staff.password) {
      return res.status(500).json({
        success: false,
        message:
          "Staff account password is not configured. Please contact administrator.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateStaffToken(staff._id.toString(), staffType);

    res.cookie("staffToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const staffData = staff.toObject();

    delete staffData.password;

    return res.status(200).json({
      success: true,
      message: "Staff login successful.",
      staff: {
        ...staffData,
        staffType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getStaff = async (req, res) => {
  try {
    const { staffId, staffType } = req;

    let staff = null;

    if (staffType === "teacher") {
      staff = await Teacher.findById(staffId)
        .select("-password")
        .populate(
          "assignedClass",
          "name section academicYear subjects roomNumber capacity",
        );
    }

    if (staffType === "peon") {
      staff = await PeonStaff.findById(staffId).select("-password");
    }

    if (staffType === "library") {
      staff = await LibraryStaff.findById(staffId).select("-password");
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found.",
      });
    }

    return res.status(200).json({
      success: true,
      staff: {
        ...staff.toObject(),
        staffType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const staffLogout = async (req, res) => {
  try {
    res.clearCookie("staffToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Staff logout successful.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
