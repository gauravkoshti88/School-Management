import express from "express";

import { getAdminDashboard } from "../controllers/adminDashboard.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.get("/", adminAuth, getAdminDashboard);

export default adminDashboardRouter;
