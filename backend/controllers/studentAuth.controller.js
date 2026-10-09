import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Student from "../models/student.model.js";

const generateStudentToken = (studentId) => {
  return jwt.sign(
    {
      studentId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

export const studentLogin = async (req, res) => {
  try {
    const { admissionNumber, password } = req.body;

    if (!admissionNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Admission number and password are required.",
      });
    }

    const normalizedAdmissionNumber = admissionNumber.trim().toUpperCase();

    const student = await Student.findOne({
      admissionNumber: normalizedAdmissionNumber,
    }).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid admission number or password.",
      });
    }

    if (student.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your student account is inactive.",
      });
    }

    if (!student.password) {
      return res.status(500).json({
        success: false,
        message:
          "Student password is not configured. Please contact school administration.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admission number or password.",
      });
    }

    const token = generateStudentToken(student._id.toString());

    res.cookie("studentToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const studentData = student.toObject();

    delete studentData.password;
    delete studentData.__v;

    return res.status(200).json({
      success: true,
      message: "Student login successful.",
      student: studentData,
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login student.",
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("-password -__v")
      .populate(
        "classId",
        "name section academicYear roomNumber capacity subjects",
      )
      .populate("createdBy", "firstName lastName employeeId")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student profile.",
    });
  }
};

export const studentLogout = async (req, res) => {
  try {
    res.clearCookie("studentToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Student logout successful.",
    });
  } catch (error) {
    console.error("Student logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout student.",
    });
  }
};
