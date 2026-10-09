import Attendance from "../models/attendance.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";

const getTeacherClass = async (teacherId) => {
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

  return {
    teacher,
    classId: teacher.assignedClass,
  };
};

const getStartAndEndOfDay = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
};

export const getTodayAttendance = async (req, res) => {
  try {
    const result = await getTeacherClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const day = getStartAndEndOfDay(req.query.date || new Date());

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const students = await Student.find({
      classId: result.classId,
      status: "active",
    })
      .select("firstName lastName rollNumber admissionNumber profileImage")
      .sort({
        rollNumber: 1,
      });

    const attendance = await Attendance.find({
      classId: result.classId,
      date: {
        $gte: day.start,
        $lte: day.end,
      },
    }).populate(
      "studentId",
      "firstName lastName rollNumber admissionNumber profileImage",
    );

    const attendanceMap = new Map();

    attendance.forEach((record) => {
      if (record.studentId?._id) {
        attendanceMap.set(record.studentId._id.toString(), record);
      }
    });

    const records = students.map((student) => {
      const existing = attendanceMap.get(student._id.toString());

      return {
        student,
        attendanceId: existing?._id || null,
        status: existing?.status || null,
        date: existing?.date || null,
      };
    });

    return res.status(200).json({
      success: true,
      date: day.start,
      records,
    });
  } catch (error) {
    console.error("Get today attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance records are required.",
      });
    }

    const result = await getTeacherClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const day = getStartAndEndOfDay(date || new Date());

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const studentIds = records.map((record) => record.studentId);

    const students = await Student.find({
      _id: {
        $in: studentIds,
      },
      classId: result.classId,
      status: "active",
    }).select("_id");

    const validStudentIds = new Set(
      students.map((student) => student._id.toString()),
    );

    for (const record of records) {
      if (!validStudentIds.has(record.studentId.toString())) {
        return res.status(403).json({
          success: false,
          message: "One or more students do not belong to your assigned class.",
        });
      }

      if (!["present", "absent", "leave"].includes(record.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance status.",
        });
      }
    }

    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          date: {
            $gte: day.start,
            $lte: day.end,
          },
        },
        update: {
          $set: {
            classId: result.classId,
            teacherId: req.staffId,
            date: day.start,
            status: record.status,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return res.status(200).json({
      success: true,
      message: "Attendance saved successfully.",
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const result = await getTeacherClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const attendance = await Attendance.findOne({
      _id: req.params.attendanceId,
      classId: result.classId,
      teacherId: req.staffId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found for your assigned class.",
      });
    }

    attendance.status = status;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const result = await getTeacherClass(req.staffId);

    if (result.error) {
      return res.status(403).json({
        success: false,
        message: result.error,
      });
    }

    const { studentId, from, to } = req.query;

    const query = {
      classId: result.classId,
    };

    if (studentId) {
      const student = await Student.findOne({
        _id: studentId,
        classId: result.classId,
      });

      if (!student) {
        return res.status(403).json({
          success: false,
          message: "Student does not belong to your class.",
        });
      }

      query.studentId = studentId;
    }

    if (from || to) {
      query.date = {};

      if (from) {
        const fromDate = getStartAndEndOfDay(from);

        if (!fromDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid from date.",
          });
        }

        query.date.$gte = fromDate.start;
      }

      if (to) {
        const toDate = getStartAndEndOfDay(to);

        if (!toDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date.",
          });
        }

        query.date.$lte = toDate.end;
      }
    }

    const attendance = await Attendance.find(query)
      .populate(
        "studentId",
        "firstName lastName rollNumber admissionNumber profileImage",
      )
      .sort({
        date: -1,
      });

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get attendance history error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
