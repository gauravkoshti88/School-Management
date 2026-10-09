import StaffAttendance from "../models/staffAttendance.model.js";
import Teacher from "../models/teacher.model.js";
import PeonStaff from "../models/peonStaff.model.js";
import LibraryStaff from "../models/libraryStaff.model.js";

const STAFF_CONFIG = {
  teacher: {
    Model: Teacher,
    staffModel: "Teacher",
  },

  peon: {
    Model: PeonStaff,
    staffModel: "PeonStaff",
  },

  library: {
    Model: LibraryStaff,
    staffModel: "LibraryStaff",
  },
};

const getStaffConfig = (staffType) => {
  return STAFF_CONFIG[staffType];
};

const normalizeDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const getDayRange = (dateValue) => {
  const date = normalizeDate(dateValue);

  if (!date) {
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

const getStaffSelectFields = () => {
  return [
    "firstName",
    "lastName",
    "email",
    "phone",
    "employeeId",
    "gender",
    "joiningDate",
    "status",
    "profileImage",
  ].join(" ");
};

// Get active staff by selected staff type
export const getStaffForAttendance = async (req, res) => {
  try {
    const { staffType } = req.query;

    if (!staffType) {
      return res.status(400).json({
        success: false,
        message: "Staff type is required.",
      });
    }

    const config = getStaffConfig(staffType);

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type. Use teacher, peon or library.",
      });
    }

    const staff = await config.Model.find({
      status: "active",
    })
      .select(getStaffSelectFields())
      .sort({
        firstName: 1,
        lastName: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      staffType,
      staffModel: config.staffModel,
      count: staff.length,
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch staff for attendance.",
    });
  }
};

// Get attendance for selected staff type and date
export const getStaffAttendance = async (req, res) => {
  try {
    const { staffType, date } = req.query;

    if (!staffType) {
      return res.status(400).json({
        success: false,
        message: "Staff type is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Attendance date is required.",
      });
    }

    const config = getStaffConfig(staffType);

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type. Use teacher, peon or library.",
      });
    }

    const dayRange = getDayRange(date);

    if (!dayRange) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const staff = await config.Model.find({
      status: "active",
    })
      .select(getStaffSelectFields())
      .sort({
        firstName: 1,
        lastName: 1,
      })
      .lean();

    const attendance = await StaffAttendance.find({
      staffType,
      date: {
        $gte: dayRange.start,
        $lte: dayRange.end,
      },
    }).lean();

    const attendanceMap = new Map();

    attendance.forEach((record) => {
      if (record.staffId) {
        attendanceMap.set(record.staffId.toString(), record);
      }
    });

    const staffWithAttendance = staff.map((member) => {
      const record = attendanceMap.get(member._id.toString());

      return {
        ...member,

        attendance: record
          ? {
              _id: record._id,
              status: record.status,
              checkIn: record.checkIn || "",
              checkOut: record.checkOut || "",
              remarks: record.remarks || "",
              markedBy: record.markedBy,
              createdAt: record.createdAt,
              updatedAt: record.updatedAt,
            }
          : {
              _id: null,
              status: "present",
              checkIn: "",
              checkOut: "",
              remarks: "",
              markedBy: null,
              createdAt: null,
              updatedAt: null,
            },

        attendanceMarked: Boolean(record),
      };
    });

    return res.status(200).json({
      success: true,
      staffType,
      date: dayRange.start,
      count: staffWithAttendance.length,
      attendanceCount: attendance.length,
      staff: staffWithAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch staff attendance.",
    });
  }
};

// Create or update attendance in bulk
export const saveStaffAttendance = async (req, res) => {
  try {
    const { staffType, date, attendance } = req.body;

    if (!staffType) {
      return res.status(400).json({
        success: false,
        message: "Staff type is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Attendance date is required.",
      });
    }

    if (!Array.isArray(attendance)) {
      return res.status(400).json({
        success: false,
        message: "Attendance must be an array.",
      });
    }

    if (attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one attendance record is required.",
      });
    }

    const config = getStaffConfig(staffType);

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type. Use teacher, peon or library.",
      });
    }

    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date.",
      });
    }

    const validStatuses = ["present", "absent", "late", "leave"];

    const staffIds = attendance.map((item) => item.staffId);

    const uniqueStaffIds = [
      ...new Set(staffIds.filter(Boolean).map((id) => id.toString())),
    ];

    if (uniqueStaffIds.length !== attendance.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate or invalid staff IDs found.",
      });
    }

    const staffMembers = await config.Model.find({
      _id: {
        $in: uniqueStaffIds,
      },
      status: "active",
    })
      .select("_id")
      .lean();

    const validStaffIds = new Set(
      staffMembers.map((member) => member._id.toString()),
    );

    const invalidStaffId = uniqueStaffIds.find((id) => !validStaffIds.has(id));

    if (invalidStaffId) {
      return res.status(400).json({
        success: false,
        message: "One or more staff members are invalid or inactive.",
      });
    }

    const operations = [];

    for (const item of attendance) {
      const status = item.status || "present";

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance status.",
        });
      }

      operations.push({
        updateOne: {
          filter: {
            staffId: item.staffId,
            date: normalizedDate,
          },

          update: {
            $set: {
              staffId: item.staffId,
              staffModel: config.staffModel,
              staffType,
              date: normalizedDate,
              status,
              checkIn: item.checkIn?.trim() || "",
              checkOut: item.checkOut?.trim() || "",
              remarks: item.remarks?.trim() || "",
              markedBy: req.adminId,
            },
          },

          upsert: true,
        },
      });
    }

    await StaffAttendance.bulkWrite(operations, {
      ordered: true,
    });

    const dayRange = getDayRange(normalizedDate);

    const savedAttendance = await StaffAttendance.find({
      staffType,
      date: {
        $gte: dayRange.start,
        $lte: dayRange.end,
      },
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Staff attendance saved successfully.",
      staffType,
      date: normalizedDate,
      count: savedAttendance.length,
      attendance: savedAttendance,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for one or more staff members.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save staff attendance.",
    });
  }
};

// Get attendance history
export const getStaffAttendanceHistory = async (req, res) => {
  try {
    const { staffType, staffId, startDate, endDate } = req.query;

    if (!staffType) {
      return res.status(400).json({
        success: false,
        message: "Staff type is required.",
      });
    }

    const config = getStaffConfig(staffType);

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff type. Use teacher, peon or library.",
      });
    }

    const filter = {
      staffType,
    };

    if (staffId) {
      filter.staffId = staffId;
    }

    if (startDate || endDate) {
      const range = {};

      if (startDate) {
        const start = normalizeDate(startDate);

        if (!start) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }

        range.$gte = start;
      }

      if (endDate) {
        const end = normalizeDate(endDate);

        if (!end) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }

        end.setHours(23, 59, 59, 999);

        range.$lte = end;
      }

      filter.date = range;
    }

    const attendance = await StaffAttendance.find(filter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

    const staffIds = [
      ...new Set(attendance.map((record) => record.staffId.toString())),
    ];

    const staffMembers = await config.Model.find({
      _id: {
        $in: staffIds,
      },
    })
      .select(getStaffSelectFields())
      .lean();

    const staffMap = new Map();

    staffMembers.forEach((member) => {
      staffMap.set(member._id.toString(), member);
    });

    const result = attendance.map((record) => ({
      ...record,
      staff: staffMap.get(record.staffId.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      staffType,
      count: result.length,
      attendance: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch staff attendance history.",
    });
  }
};

// Delete attendance record
export const deleteStaffAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID is required.",
      });
    }

    const attendance = await StaffAttendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    await StaffAttendance.findByIdAndDelete(attendanceId);

    return res.status(200).json({
      success: true,
      message: "Staff attendance deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete staff attendance.",
    });
  }
};
