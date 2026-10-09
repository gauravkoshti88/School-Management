import Student from "../models/student.model.js";
import SchoolClass from "../models/class.model.js";
import LibraryStaff from "../models/libraryStaff.model.js";
import StaffAttendance from "../models/staffAttendance.model.js";

const getLibraryStaff = async (staffId) => {
  if (!staffId) {
    return null;
  }

  const staff = await LibraryStaff.findById(staffId).select(
    "_id firstName lastName email employeeId status",
  );

  if (!staff || staff.status !== "active") {
    return null;
  }

  return staff;
};

const getClassById = async (classId) => {
  if (!classId) {
    return null;
  }

  return SchoolClass.findById(classId).select(
    "_id name section academicYear roomNumber",
  );
};

const getStudentSelectFields = () => {
  return [
    "firstName",
    "lastName",
    "profileImage",
    "fatherName",
    "motherName",
    "dateOfBirth",
    "gender",
    "rollNumber",
    "classId",
    "phone",
    "address",
    "admissionNumber",
    "status",
    "libraryBooks",
  ].join(" ");
};

// Get all classes for librarian
export const getLibraryClasses = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const classes = await SchoolClass.find({})
      .select("_id name section academicYear roomNumber")
      .sort({
        name: 1,
        section: 1,
      });

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch classes.",
    });
  }
};

// Get students of selected class
export const getLibraryStudents = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required.",
      });
    }

    const schoolClass = await getClassById(classId);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found.",
      });
    }

    const students = await Student.find({
      classId,
      status: "active",
    })
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber")
      .sort({
        rollNumber: 1,
      });

    return res.status(200).json({
      success: true,
      class: schoolClass,
      count: students.length,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch students.",
    });
  }
};

// Get particular student
export const getLibraryStudentById = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    const student = await Student.findById(studentId)
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber");

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
    return res.status(500).json({
      success: false,
      message: "Unable to fetch student.",
    });
  }
};

// Issue book to student
export const issueBook = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { studentId } = req.params;

    const { bookName, issueDate, returnDate, remarks = "" } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    if (!bookName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Book name is required.",
      });
    }

    if (!issueDate) {
      return res.status(400).json({
        success: false,
        message: "Issue date is required.",
      });
    }

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: "Return date is required.",
      });
    }

    const parsedIssueDate = new Date(issueDate);
    const parsedReturnDate = new Date(returnDate);

    if (
      Number.isNaN(parsedIssueDate.getTime()) ||
      Number.isNaN(parsedReturnDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue or return date.",
      });
    }

    if (parsedReturnDate < parsedIssueDate) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before issue date.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (student.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Book cannot be issued to an inactive student.",
      });
    }

    const normalizedBookName = bookName.trim();

    const alreadyIssued = student.libraryBooks.some(
      (book) =>
        book.status === "issued" &&
        book.bookName.trim().toLowerCase() === normalizedBookName.toLowerCase(),
    );

    if (alreadyIssued) {
      return res.status(409).json({
        success: false,
        message: "This book is already issued to this student.",
      });
    }

    student.libraryBooks.push({
      bookName: normalizedBookName,
      issueDate: parsedIssueDate,
      returnDate: parsedReturnDate,
      returnedDate: null,
      status: "issued",
      remarks: remarks.trim(),
    });

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber");

    const libraryBook =
      updatedStudent.libraryBooks[updatedStudent.libraryBooks.length - 1];

    return res.status(201).json({
      success: true,
      message: "Book issued successfully.",
      student: updatedStudent,
      libraryBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to issue book.",
    });
  }
};

// Receive book from student
export const receiveBook = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { studentId, libraryBookId } = req.params;

    if (!studentId || !libraryBookId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and library book ID are required.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const libraryBook = student.libraryBooks.id(libraryBookId);

    if (!libraryBook) {
      return res.status(404).json({
        success: false,
        message: "Library book record not found.",
      });
    }

    if (libraryBook.status === "returned") {
      return res.status(409).json({
        success: false,
        message: "This book has already been returned.",
      });
    }

    libraryBook.status = "returned";
    libraryBook.returnedDate = new Date();

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber");

    return res.status(200).json({
      success: true,
      message: "Book received successfully.",
      student: updatedStudent,
      libraryBook: updatedStudent.libraryBooks.id(libraryBookId),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to receive book.",
    });
  }
};

// Update library book record
export const updateLibraryBook = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { studentId, libraryBookId } = req.params;

    const { bookName, issueDate, returnDate, remarks } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const libraryBook = student.libraryBooks.id(libraryBookId);

    if (!libraryBook) {
      return res.status(404).json({
        success: false,
        message: "Library book record not found.",
      });
    }

    if (bookName !== undefined) {
      if (!bookName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Book name cannot be empty.",
        });
      }

      libraryBook.bookName = bookName.trim();
    }

    if (issueDate !== undefined) {
      const parsedIssueDate = new Date(issueDate);

      if (Number.isNaN(parsedIssueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid issue date.",
        });
      }

      libraryBook.issueDate = parsedIssueDate;
    }

    if (returnDate !== undefined) {
      const parsedReturnDate = new Date(returnDate);

      if (Number.isNaN(parsedReturnDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid return date.",
        });
      }

      libraryBook.returnDate = parsedReturnDate;
    }

    if (
      libraryBook.returnDate &&
      libraryBook.issueDate &&
      libraryBook.returnDate < libraryBook.issueDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before issue date.",
      });
    }

    if (remarks !== undefined) {
      libraryBook.remarks = remarks.trim();
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber");

    return res.status(200).json({
      success: true,
      message: "Library book updated successfully.",
      student: updatedStudent,
      libraryBook: updatedStudent.libraryBooks.id(libraryBookId),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update library book.",
    });
  }
};

// Delete library book history record
export const deleteLibraryBook = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const { studentId, libraryBookId } = req.params;

    if (!studentId || !libraryBookId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and library book ID are required.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const libraryBook = student.libraryBooks.id(libraryBookId);

    if (!libraryBook) {
      return res.status(404).json({
        success: false,
        message: "Library book record not found.",
      });
    }

    if (libraryBook.status === "issued") {
      return res.status(400).json({
        success: false,
        message: "Issued book cannot be deleted. Receive the book first.",
      });
    }

    libraryBook.deleteOne();

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .select(getStudentSelectFields())
      .populate("classId", "name section academicYear roomNumber");

    return res.status(200).json({
      success: true,
      message: "Library book record deleted successfully.",
      student: updatedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete library book record.",
    });
  }
};

// Get library dashboard statistics
export const getLibraryDashboard = async (req, res) => {
  try {
    const librarian = await getLibraryStaff(req.staffId);

    if (!librarian) {
      return res.status(403).json({
        success: false,
        message: "Active librarian authentication required.",
      });
    }

    const students = await Student.find({
      status: "active",
    }).select("libraryBooks");

    let totalIssued = 0;
    let totalReturned = 0;
    let totalOverdue = 0;

    const today = new Date();

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    students.forEach((student) => {
      student.libraryBooks.forEach((book) => {
        if (book.status === "issued") {
          totalIssued += 1;

          if (book.returnDate && new Date(book.returnDate) < todayStart) {
            totalOverdue += 1;
          }
        }

        if (book.status === "returned") {
          totalReturned += 1;
        }
      });
    });

    // Get librarian attendance history
    const attendanceHistory = await StaffAttendance.find({
      staffId: librarian._id,
      staffModel: "LibraryStaff",
      staffType: "library",
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .sort({
        date: -1,
      })
      .limit(30)
      .lean();

    const todayAttendance = await StaffAttendance.findOne({
      staffId: librarian._id,
      staffModel: "LibraryStaff",
      staffType: "library",
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .lean();

    const totalAttendance = attendanceHistory.length;

    const presentDays = attendanceHistory.filter(
      (item) => item.status === "present",
    ).length;

    const absentDays = attendanceHistory.filter(
      (item) => item.status === "absent",
    ).length;

    const lateDays = attendanceHistory.filter(
      (item) => item.status === "late",
    ).length;

    const leaveDays = attendanceHistory.filter(
      (item) => item.status === "leave",
    ).length;

    const attendancePercentage =
      totalAttendance > 0
        ? Number(((presentDays / totalAttendance) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,

      statistics: {
        totalStudents: students.length,
        totalIssued,
        totalReturned,
        totalOverdue,
      },

      attendance: {
        today: todayAttendance,

        statistics: {
          totalDays: totalAttendance,
          presentDays,
          absentDays,
          lateDays,
          leaveDays,
          attendancePercentage,
        },

        history: attendanceHistory,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch library dashboard.",
    });
  }
};
