import StaffAttendance from "../models/staffAttendance.model.js";
import PeonStaff from "../models/peonStaff.model.js";

const getPeon = async (staffId) => {
  if (!staffId) {
    return null;
  }

  const peon = await PeonStaff.findById(staffId).select(
    "_id firstName lastName email employeeId status shift",
  );

  if (!peon || peon.status !== "active") {
    return null;
  }

  return peon;
};

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

export const getPeonDashboard = async (req, res) => {
  try {
    const peon = await getPeon(req.staffId);

    if (!peon) {
      return res.status(403).json({
        success: false,
        message: "Active peon authentication required.",
      });
    }

    const todayRange = getDayRange();

    if (!todayRange) {
      return res.status(400).json({
        success: false,
        message: "Unable to determine today's date.",
      });
    }

    const todayAttendance = await StaffAttendance.findOne({
      staffId: peon._id,
      staffModel: "PeonStaff",
      staffType: "peon",
      date: {
        $gte: todayRange.start,
        $lte: todayRange.end,
      },
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .lean();

    const history = await StaffAttendance.find({
      staffId: peon._id,
      staffModel: "PeonStaff",
      staffType: "peon",
    })
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .sort({
        date: -1,
      })
      .limit(30)
      .lean();

    const totalDays = history.length;

    const presentDays = history.filter(
      (item) => item.status === "present",
    ).length;

    const absentDays = history.filter(
      (item) => item.status === "absent",
    ).length;

    const lateDays = history.filter((item) => item.status === "late").length;

    const leaveDays = history.filter((item) => item.status === "leave").length;

    const attendancePercentage =
      totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,

      peon: {
        _id: peon._id,
        firstName: peon.firstName,
        lastName: peon.lastName,
        email: peon.email,
        employeeId: peon.employeeId,
        status: peon.status,
        shift: peon.shift,
      },

      today: {
        date: todayRange.start,
        attendance: todayAttendance,
      },

      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendancePercentage,
      },

      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch peon dashboard.",
    });
  }
};

export const getPeonAttendanceHistory = async (req, res) => {
  try {
    const peon = await getPeon(req.staffId);

    if (!peon) {
      return res.status(403).json({
        success: false,
        message: "Active peon authentication required.",
      });
    }

    const { startDate, endDate, status, limit = 50 } = req.query;

    const query = {
      staffId: peon._id,
      staffModel: "PeonStaff",
      staffType: "peon",
    };

    if (status) {
      const allowedStatuses = ["present", "absent", "late", "leave"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attendance status.",
        });
      }

      query.status = status;
    }

    if (startDate || endDate) {
      const dateQuery = {};

      if (startDate) {
        const start = getDayRange(startDate);

        if (!start) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }

        dateQuery.$gte = start.start;
      }

      if (endDate) {
        const end = getDayRange(endDate);

        if (!end) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }

        dateQuery.$lte = end.end;
      }

      query.date = dateQuery;
    }

    const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

    const history = await StaffAttendance.find(query)
      .select("_id date status checkIn checkOut remarks createdAt updatedAt")
      .sort({
        date: -1,
      })
      .limit(parsedLimit)
      .lean();

    return res.status(200).json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch attendance history.",
    });
  }
};
