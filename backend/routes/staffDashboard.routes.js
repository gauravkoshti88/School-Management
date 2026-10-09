import express from "express";

import { getStaffDashboard } from "../controllers/staffDashboard.controller.js";
import staffAuth from "../middleware/staffAuth.js";

const staffDashboardRouter = express.Router();

staffDashboardRouter.get("/", staffAuth, getStaffDashboard);

export default staffDashboardRouter;
