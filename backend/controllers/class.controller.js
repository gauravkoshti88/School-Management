import mongoose from "mongoose";
import SchoolClass from "../models/class.model.js";
import Teacher from "../models/teacher.model.js";

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      code: "DUPLICATE_CLASS",
      message: "This class, section and academic year already exists.",
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

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data provided.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

// Create class
export const createClass = async (req, res) => {
  try {
    const {
      name,
      section,
      academicYear,
      classTeacher,
      subjects,
      roomNumber,
      capacity,
      status,
    } = req.body;

    let teacher = null;

    if (classTeacher) {
      if (!mongoose.Types.ObjectId.isValid(classTeacher)) {
        return res.status(400).json({
          success: false,
          message: "Invalid class teacher ID.",
        });
      }

      teacher = await Teacher.findById(classTeacher);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Selected teacher not found.",
        });
      }

      if (teacher.assignedClass) {
        return res.status(409).json({
          success: false,
          code: "TEACHER_ALREADY_ASSIGNED",
          message: "This teacher is already assigned as a class teacher.",
        });
      }
    }

    const schoolClass = await SchoolClass.create({
      name,
      section,
      academicYear,
      classTeacher: classTeacher || null,
      subjects,
      roomNumber: roomNumber || "",
      capacity: capacity || 40,
      status: status || "active",
    });

    if (teacher) {
      teacher.assignedClass = schoolClass._id;
      await teacher.save();
    }

    const populatedClass = await SchoolClass.findById(schoolClass._id).populate(
      "classTeacher",
      "firstName lastName email phone employeeId assignedClass",
    );

    return res.status(201).json({
      success: true,
      message: "Class created successfully.",
      class: populatedClass,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get all classes
export const getClasses = async (req, res) => {
  try {
    const classes = await SchoolClass.find()
      .populate(
        "classTeacher",
        "firstName lastName email phone employeeId assignedClass",
      )
      .sort({
        academicYear: -1,
        name: 1,
        section: 1,
      });

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Get class by ID
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID.",
      });
    }

    const schoolClass = await SchoolClass.findById(id).populate(
      "classTeacher",
      "firstName lastName email phone employeeId assignedClass",
    );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    return res.status(200).json({
      success: true,
      class: schoolClass,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID.",
      });
    }

    const existingClass = await SchoolClass.findById(id);

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const allowedFields = [
      "name",
      "section",
      "academicYear",
      "classTeacher",
      "subjects",
      "roomNumber",
      "capacity",
      "status",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.classTeacher === "") {
      updateData.classTeacher = null;
    }

    const previousTeacherId = existingClass.classTeacher
      ? existingClass.classTeacher.toString()
      : null;

    const newTeacherId = updateData.classTeacher
      ? updateData.classTeacher.toString()
      : null;

    let newTeacher = null;

    if (newTeacherId) {
      if (!mongoose.Types.ObjectId.isValid(newTeacherId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid class teacher ID.",
        });
      }

      newTeacher = await Teacher.findById(newTeacherId);

      if (!newTeacher) {
        return res.status(404).json({
          success: false,
          message: "Selected teacher not found.",
        });
      }

      const teacherAlreadyAssignedElsewhere =
        newTeacher.assignedClass && newTeacher.assignedClass.toString() !== id;

      if (teacherAlreadyAssignedElsewhere) {
        return res.status(409).json({
          success: false,
          code: "TEACHER_ALREADY_ASSIGNED",
          message: "This teacher is already assigned as a class teacher.",
        });
      }
    }

    Object.assign(existingClass, updateData);

    await existingClass.save();

    if (previousTeacherId && previousTeacherId !== newTeacherId) {
      await Teacher.findByIdAndUpdate(previousTeacherId, {
        assignedClass: null,
      });
    }

    if (newTeacherId) {
      await Teacher.findByIdAndUpdate(newTeacherId, {
        assignedClass: existingClass._id,
      });
    }

    const populatedClass = await SchoolClass.findById(
      existingClass._id,
    ).populate(
      "classTeacher",
      "firstName lastName email phone employeeId assignedClass",
    );

    return res.status(200).json({
      success: true,
      message: "Class updated successfully.",
      class: populatedClass,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID.",
      });
    }

    const schoolClass = await SchoolClass.findById(id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const teacherId = schoolClass.classTeacher
      ? schoolClass.classTeacher.toString()
      : null;

    await SchoolClass.findByIdAndDelete(id);

    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
        assignedClass: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully.",
      class: schoolClass,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
