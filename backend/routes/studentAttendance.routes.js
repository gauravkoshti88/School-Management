import express from "express";

import {
  getAttendanceHistory,
  getTodayAttendance,
  markAttendance,
  updateAttendance,
} from "../controllers/studentAttendance.controller.js";
import staffAuth from "../middleware/staffAuth.js";

const studentAttendanceRouter = express.Router();

studentAttendanceRouter.use(staffAuth);

studentAttendanceRouter.get("/", getTodayAttendance);

studentAttendanceRouter.post("/", markAttendance);

studentAttendanceRouter.put("/:attendanceId", updateAttendance);

studentAttendanceRouter.get("/history", getAttendanceHistory);

export default studentAttendanceRouter;
