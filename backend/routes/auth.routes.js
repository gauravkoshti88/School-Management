import express from "express";

import {
  getStaff,
  staffLogin,
  staffLogout,
} from "../controllers/auth.controller.js";
import staffAuth from "../middleware/StaffAuth.js";

const authRouter = express.Router();

// Staff login
authRouter.post("/staff/login", staffLogin);

// Get logged-in staff
authRouter.get("/staff/me", staffAuth, getStaff);

// Staff logout
authRouter.post("/staff/logout", staffAuth, staffLogout);

export default authRouter;
