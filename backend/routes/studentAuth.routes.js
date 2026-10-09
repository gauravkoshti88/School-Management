import express from "express";

import {
  getStudent,
  studentLogin,
  studentLogout,
} from "../controllers/studentAuth.controller.js";

import studentAuth from "../middleware/studentAuth.js";

const studentAuthRouter = express.Router();

studentAuthRouter.post("/login", studentLogin);

studentAuthRouter.get("/me", studentAuth, getStudent);

studentAuthRouter.post("/logout", studentAuth, studentLogout);

export default studentAuthRouter;
