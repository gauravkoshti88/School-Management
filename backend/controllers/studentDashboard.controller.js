import Attendance from "../models/attendance.model.js";
import Student from "../models/student.model.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.studentId)
      .select("-password -__v")
      .populate(
        "classId",
        "name section academicYear roomNumber capacity subjects",
      )
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const attendanceRecords = await Attendance.find({
      studentId: student._id,
    })
      .sort({
        date: -1,
      })
      .select("classId teacherId date status createdAt")
      .populate("teacherId", "firstName lastName employeeId")
      .lean();

    const totalAttendance = attendanceRecords.length;

    const presentCount = attendanceRecords.filter(
      (item) => item.status === "present",
    ).length;

    const absentCount = attendanceRecords.filter(
      (item) => item.status === "absent",
    ).length;

    const leaveCount = attendanceRecords.filter(
      (item) => item.status === "leave",
    ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? Number(((presentCount / totalAttendance) * 100).toFixed(2))
        : 0;

    // Library book records
    const libraryBooks = student.libraryBooks || [];

    const totalBooks = libraryBooks.length;

    const issuedBooks = libraryBooks.filter(
      (book) => book.status === "issued",
    ).length;

    const returnedBooks = libraryBooks.filter(
      (book) => book.status === "returned",
    ).length;

    const overdueBooks = libraryBooks.filter((book) => {
      if (book.status !== "issued") {
        return false;
      }

      if (!book.returnDate) {
        return false;
      }

      return new Date(book.returnDate) < new Date();
    }).length;

    const libraryHistory = [...libraryBooks].sort((a, b) => {
      const dateA = new Date(a.returnedDate || a.issueDate || 0);

      const dateB = new Date(b.returnedDate || b.issueDate || 0);

      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,

      student,

      attendance: {
        summary: {
          total: totalAttendance,
          present: presentCount,
          absent: absentCount,
          leave: leaveCount,
          percentage: attendancePercentage,
        },

        records: attendanceRecords,
      },

      library: {
        summary: {
          total: totalBooks,
          issued: issuedBooks,
          returned: returnedBooks,
          overdue: overdueBooks,
        },

        currentlyIssued: libraryBooks.filter(
          (book) => book.status === "issued",
        ),

        history: libraryHistory,
      },
    });
  } catch (error) {
    console.error("Get student dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student dashboard.",
    });
  }
};
