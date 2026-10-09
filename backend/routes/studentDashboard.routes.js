import express from "express";

import { getStudentDashboard } from "../controllers/studentDashboard.controller.js";

import studentAuth from "../middleware/studentAuth.js";

const studentDashboardRouter = express.Router();

studentDashboardRouter.get("/", studentAuth, getStudentDashboard);

export default studentDashboardRouter;
