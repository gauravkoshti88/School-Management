import bcrypt from "bcryptjs";

import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import SchoolClass from "../models/class.model.js";
import Attendance from "../models/attendance.model.js";

import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";

const getAssignedClass = async (teacherId) => {
  const teacher = await Teacher.findById(teacherId).select(
    "assignedClass status",
  );

  if (!teacher) {
    return {
      error: "Teacher not found.",
    };
  }

  if (teacher.status !== "active") {
    return {
      error: "Your teacher account is inactive.",
    };
  }

  if (!teacher.assignedClass) {
    return {
      error: "You are not assigned to any class.",
    };
  }

  const assignedClass = await SchoolClass.findById(teacher.assignedClass);

  if (!assignedClass) {
    return {
      error: "Assigned class not found.",
    };
  }

  return {
    teacher,
    assignedClass,
  };
};

const getClassNumber = (className) => {
  const classNumber = Number(String(className).replace(/\D/g, ""));

  if (!classNumber || classNumber < 1) {
    return null;
  }

  return classNumber;
};

const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ADM${year}`;

  const lastStudent = await Student.findOne({
    admissionNumber: {
      $regex: `^${prefix}`,
    },
  })
    .sort({
      admissionNumber: -1,
    })
    .select("admissionNumber");

  let nextNumber = 1;

  if (lastStudent?.admissionNumber) {
    const lastNumber = Number(lastStudent.admissionNumber.slice(prefix.length));

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};

const generateRollNumber = async (classId, className) => {
  const classNumber = getClassNumber(className);

  if (!classNumber) {
    throw new Error(
      "Invalid class name. Class name must contain a valid number.",
    );
  }

  const prefix = String(classNumber);

  const lastStudent = await Student.findOne({
    classId,
    rollNumber: {
      $regex: `^${prefix}`,
    },
  })
    .sort({
      rollNumber: -1,
    })
    .select("rollNumber");

  let nextNumber = 1;

  if (lastStudent?.rollNumber) {
    const lastRollNumber = String(lastStudent.rollNumber);

    const sequence = Number(lastRollNumber.slice(prefix.length));

    if (!Number.isNaN(sequence)) {
      nextNumber = sequence + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(2, "0")}`;
};

export const createStaffStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      phone,
      address,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !motherName ||
      !dateOfBirth ||
      !gender ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required student fields including password must be provided.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Student password must be at least 6 characters.",
      });
    }

    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const { assignedClass } = result;

    const admissionNumber = await generateAdmissionNumber();

    const rollNumber = await generateRollNumber(
      assignedClass._id,
      assignedClass.name,
    );

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      dateOfBirth,
      gender,
      rollNumber,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      admissionNumber,
      classId: assignedClass._id,
      createdBy: req.staffId,
      password: hashedPassword,
      status: "active",
    });

    const populatedStudent = await Student.findById(student._id)
      .select("-__v -password")
      .populate("classId", "name section academicYear roomNumber");

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("Create staff student error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student number already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getStaffStudents = async (req, res) => {
  try {
    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const students = await Student.find({
      classId: result.assignedClass._id,
    })
      .select("-__v -password")
      .populate("classId", "name section academicYear roomNumber")
      .sort({
        rollNumber: 1,
        firstName: 1,
      });

    return res.status(200).json({
      success: true,
      students,
      class: result.assignedClass,
      count: students.length,
    });
  } catch (error) {
    console.error("Get staff students error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getStaffStudentById = async (req, res) => {
  try {
    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const student = await Student.findOne({
      _id: req.params.studentId,
      classId: result.assignedClass._id,
    })
      .select("-__v -password")
      .populate("classId", "name section academicYear roomNumber");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your assigned class.",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get staff student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateStaffStudent = async (req, res) => {
  try {
    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const student = await Student.findOne({
      _id: req.params.studentId,
      classId: result.assignedClass._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your assigned class.",
      });
    }

    const {
      firstName,
      lastName,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      phone,
      address,
      status,
      password,
    } = req.body;

    if (firstName !== undefined) {
      student.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      student.lastName = lastName.trim();
    }

    if (fatherName !== undefined) {
      student.fatherName = fatherName.trim();
    }

    if (motherName !== undefined) {
      student.motherName = motherName.trim();
    }

    if (dateOfBirth !== undefined) {
      student.dateOfBirth = dateOfBirth;
    }

    if (gender !== undefined) {
      student.gender = gender;
    }

    if (phone !== undefined) {
      student.phone = phone.trim();
    }

    if (address !== undefined) {
      student.address = address.trim();
    }

    if (status !== undefined) {
      student.status = status;
    }

    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Student password must be at least 6 characters.",
        });
      }

      student.password = await bcrypt.hash(password, 12);
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .select("-__v -password")
      .populate("classId", "name section academicYear roomNumber");

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update staff student error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student information already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const uploadStaffStudentProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const student = await Student.findOne({
      _id: req.params.studentId,
      classId: result.assignedClass._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your assigned class.",
      });
    }

    const oldPublicId = student.profileImage?.publicId;

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "school-management/students",
    );

    student.profileImage = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      alt:
        req.body.alt?.trim() ||
        `${student.firstName} ${student.lastName} profile image`,
    };

    await student.save();

    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (deleteError) {
        console.error("Delete old student profile image error:", deleteError);
      }
    }

    const updatedStudent = await Student.findById(student._id)
      .select("-__v -password")
      .populate("classId", "name section academicYear roomNumber");

    return res.status(200).json({
      success: true,
      message: "Student profile image updated successfully.",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Upload student profile image error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload student profile image.",
    });
  }
};

export const deleteStaffStudent = async (req, res) => {
  try {
    const result = await getAssignedClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const student = await Student.findOne({
      _id: req.params.studentId,
      classId: result.assignedClass._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your assigned class.",
      });
    }

    await Attendance.deleteMany({
      studentId: student._id,
      classId: result.assignedClass._id,
    });

    const profileImagePublicId = student.profileImage?.publicId;

    await Student.findByIdAndDelete(student._id);

    if (profileImagePublicId) {
      try {
        await deleteFromCloudinary(profileImagePublicId);
      } catch (deleteError) {
        console.error("Delete student profile image error:", deleteError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Student removed successfully.",
    });
  } catch (error) {
    console.error("Delete staff student error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
