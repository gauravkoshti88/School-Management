import Student from "../models/student.model.js";

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("-password -__v")
      .populate("classId", "name section academicYear roomNumber")
      .populate("createdBy", "firstName lastName employeeId")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load students.",
    });
  }
};
