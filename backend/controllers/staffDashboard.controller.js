import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import StaffAttendance from "../models/staffAttendance.model.js";

const getDayRange = (dateValue) => {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();

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

export const getStaffDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.staffId)
      .select("-password")
      .populate({
        path: "assignedClass",
        select:
          "name section academicYear classTeacher subjects roomNumber capacity status",
        populate: {
          path: "classTeacher",
          select: "firstName lastName email employeeId",
        },
      });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    if (teacher.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your teacher account is inactive.",
      });
    }

    const todayRange = getDayRange();

    if (!todayRange) {
      return res.status(400).json({
        success: false,
        message: "Unable to determine today's date.",
      });
    }

    const teacherAttendance = await StaffAttendance.find({
      staffId: teacher._id,
      staffModel: "Teacher",
      staffType: "teacher",
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .sort({
        date: -1,
      })
      .limit(100)
      .lean();

    const todayStaffAttendance = await StaffAttendance.findOne({
      staffId: teacher._id,
      staffModel: "Teacher",
      staffType: "teacher",
      date: {
        $gte: todayRange.start,
        $lte: todayRange.end,
      },
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .lean();

    const totalAttendanceDays = teacherAttendance.length;

    const presentDays = teacherAttendance.filter(
      (item) => item.status === "present",
    ).length;

    const absentDays = teacherAttendance.filter(
      (item) => item.status === "absent",
    ).length;

    const lateDays = teacherAttendance.filter(
      (item) => item.status === "late",
    ).length;

    const leaveDays = teacherAttendance.filter(
      (item) => item.status === "leave",
    ).length;

    const attendancePercentage =
      totalAttendanceDays > 0
        ? Number(((presentDays / totalAttendanceDays) * 100).toFixed(2))
        : 0;

    if (!teacher.assignedClass) {
      return res.status(200).json({
        success: true,

        teacher: {
          _id: teacher._id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          employeeId: teacher.employeeId,
          status: teacher.status,
          staffType: "teacher",
        },

        assignedClass: null,

        stats: {
          totalStudents: 0,
          presentToday: 0,
          absentToday: 0,
          leaveToday: 0,
          attendanceMarked: 0,
          attendancePercentage: 0,
          classCapacity: 0,
          availableSeats: 0,
        },

        staffAttendance: {
          today: todayStaffAttendance,
          statistics: {
            totalDays: totalAttendanceDays,
            presentDays,
            absentDays,
            lateDays,
            leaveDays,
            attendancePercentage,
          },
          history: teacherAttendance,
        },
      });
    }

    const assignedClass = teacher.assignedClass;

    const totalStudents = await Student.countDocuments({
      classId: assignedClass._id,
      status: "active",
    });

    const attendance = await Attendance.find({
      classId: assignedClass._id,
      date: {
        $gte: todayRange.start,
        $lte: todayRange.end,
      },
    }).select("status");

    const presentToday = attendance.filter(
      (item) => item.status === "present",
    ).length;

    const absentToday = attendance.filter(
      (item) => item.status === "absent",
    ).length;

    const leaveToday = attendance.filter(
      (item) => item.status === "leave",
    ).length;

    const attendanceMarked = attendance.length;

    const studentAttendancePercentage =
      totalStudents > 0
        ? Number(((presentToday / totalStudents) * 100).toFixed(2))
        : 0;

    const classCapacity = assignedClass.capacity || 0;

    const availableSeats = Math.max(classCapacity - totalStudents, 0);

    return res.status(200).json({
      success: true,

      teacher: {
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        employeeId: teacher.employeeId,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experience: teacher.experience,
        joiningDate: teacher.joiningDate,
        department: teacher.department,
        status: teacher.status,
        staffType: "teacher",
      },

      assignedClass,

      stats: {
        totalStudents,
        presentToday,
        absentToday,
        leaveToday,
        attendanceMarked,
        attendancePercentage: studentAttendancePercentage,
        classCapacity,
        availableSeats,
      },

      staffAttendance: {
        today: todayStaffAttendance,

        statistics: {
          totalDays: totalAttendanceDays,
          presentDays,
          absentDays,
          lateDays,
          leaveDays,
          attendancePercentage,
        },

        history: teacherAttendance,
      },
    });
  } catch (error) {
    console.error("Get staff dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
