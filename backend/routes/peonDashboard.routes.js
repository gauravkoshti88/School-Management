import express from "express";

import {
  getPeonDashboard,
  getPeonAttendanceHistory,
} from "../controllers/peonDashboard.controller.js";

import staffAuth from "../middleware/staffAuth.js";

const peonDashboardRouter = express.Router();

peonDashboardRouter.use(staffAuth);

peonDashboardRouter.get("/", getPeonDashboard);

peonDashboardRouter.get("/history", getPeonAttendanceHistory);

export default peonDashboardRouter;
