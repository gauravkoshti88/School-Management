import express from "express";

import {
  deleteStaffAttendance,
  getStaffAttendance,
  getStaffAttendanceHistory,
  getStaffForAttendance,
  saveStaffAttendance,
} from "../controllers/staffAttendance.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const staffAttendanceRouter = express.Router();

staffAttendanceRouter.use(adminAuth);

// Get active staff by staff type
staffAttendanceRouter.get("/staff", getStaffForAttendance);

// Get attendance by staff type and date
staffAttendanceRouter.get("/", getStaffAttendance);

// Save or update attendance
staffAttendanceRouter.post("/bulk", saveStaffAttendance);

// Get attendance history
staffAttendanceRouter.get("/history", getStaffAttendanceHistory);

// Delete attendance record
staffAttendanceRouter.delete("/:attendanceId", deleteStaffAttendance);

export default staffAttendanceRouter;
