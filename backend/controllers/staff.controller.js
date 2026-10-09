import bcrypt from "bcryptjs";

import Teacher from "../models/teacher.model.js";
import PeonStaff from "../models/peonStaff.model.js";
import LibraryStaff from "../models/libraryStaff.model.js";

import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.utils.js";

const sendError = (res, error) => {
  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    const fieldNames = {
      email: "Email",
      employeeId: "Employee ID",
    };

    const fieldName = fieldNames[duplicateField] || duplicateField;

    return res.status(409).json({
      success: false,
      code: "DUPLICATE_FIELD",
      field: duplicateField,
      message: `${fieldName} already exists.`,
    });
  }

  if (error.name === "ValidationError") {
    const errors = {};

    Object.keys(error.errors).forEach((field) => {
      errors[field] = error.errors[field].message;
    });

    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please check the provided information.",
      errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

const removePassword = (document) => {
  const data = document.toObject();

  delete data.password;

  return data;
};

const uploadStaffImage = async ({ staff, staffType, file, alt }) => {
  const folder = `school-management/staff/${staffType}`;

  const result = await uploadBufferToCloudinary(file.buffer, folder);

  const oldPublicId = staff.profileImage?.publicId;

  staff.profileImage = {
    publicId: result.public_id,
    url: result.secure_url,
    alt: alt || `${staff.firstName} ${staff.lastName} profile image`,
  };

  await staff.save();

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  return staff;
};

// Create teacher
export const createTeacher = async (req, res) => {
  try {
    const { password, ...teacherData } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Temporary password must be at least 6 characters.",
      });
    }

    const hashedPassword = await hashPassword(password.trim());

    const teacher = await Teacher.create({
      ...teacherData,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher: removePassword(teacher),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select("-password")
      .populate("assignedClass", "name section academicYear")
      .sort({
        firstName: 1,
        lastName: 1,
      });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get teacher
export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select("-password")
      .populate("assignedClass", "name section academicYear")
      .lean();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { password, ...teacherData } = req.body;

    const updateData = {
      ...teacherData,
    };

    if (password !== undefined && password !== "") {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          code: "INVALID_PASSWORD",
          message: "Temporary password must be at least 6 characters.",
        });
      }

      updateData.password = await hashPassword(password.trim());
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("assignedClass", "name section academicYear");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Upload teacher profile image
export const uploadTeacherProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const updatedTeacher = await uploadStaffImage({
      staff: teacher,
      staffType: "teacher",
      file: req.file,
      alt: req.body.alt,
    });

    return res.status(200).json({
      success: true,
      message: "Teacher profile image uploaded successfully.",
      profileImage: updatedTeacher.profileImage,
      teacher: removePassword(updatedTeacher),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const publicId = teacher.profileImage?.publicId;

    await Teacher.findByIdAndDelete(req.params.id);

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Create peon staff
export const createPeonStaff = async (req, res) => {
  try {
    const { password, ...staffData } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Temporary password must be at least 6 characters.",
      });
    }

    const hashedPassword = await hashPassword(password.trim());

    const staff = await PeonStaff.create({
      ...staffData,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Peon staff created successfully",
      staff: removePassword(staff),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get peon staff
export const getPeonStaff = async (req, res) => {
  try {
    const staff = await PeonStaff.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get peon staff by ID
export const getPeonStaffById = async (req, res) => {
  try {
    const staff = await PeonStaff.findById(req.params.id)
      .select("-password")
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Peon staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Update peon staff
export const updatePeonStaff = async (req, res) => {
  try {
    const { password, ...staffData } = req.body;

    const updateData = {
      ...staffData,
    };

    if (password !== undefined && password !== "") {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          code: "INVALID_PASSWORD",
          message: "Temporary password must be at least 6 characters.",
        });
      }

      updateData.password = await hashPassword(password.trim());
    }

    const staff = await PeonStaff.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Peon staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Peon staff updated successfully",
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Upload peon staff profile image
export const uploadPeonStaffProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const staff = await PeonStaff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Peon staff not found",
      });
    }

    const updatedStaff = await uploadStaffImage({
      staff,
      staffType: "peon",
      file: req.file,
      alt: req.body.alt,
    });

    return res.status(200).json({
      success: true,
      message: "Peon staff profile image uploaded successfully.",
      profileImage: updatedStaff.profileImage,
      staff: removePassword(updatedStaff),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Delete peon staff
export const deletePeonStaff = async (req, res) => {
  try {
    const staff = await PeonStaff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Peon staff not found",
      });
    }

    const publicId = staff.profileImage?.publicId;

    await PeonStaff.findByIdAndDelete(req.params.id);

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Peon staff deleted successfully",
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Create library staff
export const createLibraryStaff = async (req, res) => {
  try {
    const { password, ...staffData } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Temporary password must be at least 6 characters.",
      });
    }

    const hashedPassword = await hashPassword(password.trim());

    const staff = await LibraryStaff.create({
      ...staffData,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Library staff created successfully",
      staff: removePassword(staff),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get library staff
export const getLibraryStaff = async (req, res) => {
  try {
    const staff = await LibraryStaff.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get library staff by ID
export const getLibraryStaffById = async (req, res) => {
  try {
    const staff = await LibraryStaff.findById(req.params.id)
      .select("-password")
      .lean();

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Library staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Update library staff
export const updateLibraryStaff = async (req, res) => {
  try {
    const { password, ...staffData } = req.body;

    const updateData = {
      ...staffData,
    };

    if (password !== undefined && password !== "") {
      if (password.trim().length < 6) {
        return res.status(400).json({
          success: false,
          code: "INVALID_PASSWORD",
          message: "Temporary password must be at least 6 characters.",
        });
      }

      updateData.password = await hashPassword(password.trim());
    }

    const staff = await LibraryStaff.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Library staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Library staff updated successfully",
      staff,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Upload library staff profile image
export const uploadLibraryStaffProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const staff = await LibraryStaff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Library staff not found",
      });
    }

    const updatedStaff = await uploadStaffImage({
      staff,
      staffType: "library",
      file: req.file,
      alt: req.body.alt,
    });

    return res.status(200).json({
      success: true,
      message: "Library staff profile image uploaded successfully.",
      profileImage: updatedStaff.profileImage,
      staff: removePassword(updatedStaff),
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Delete library staff
export const deleteLibraryStaff = async (req, res) => {
  try {
    const staff = await LibraryStaff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Library staff not found",
      });
    }

    const publicId = staff.profileImage?.publicId;

    await LibraryStaff.findByIdAndDelete(req.params.id);

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Library staff deleted successfully",
    });
  } catch (error) {
    return sendError(res, error);
  }
};
