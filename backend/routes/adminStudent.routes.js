import express from "express";

import { getAllStudents } from "../controllers/adminStudent.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const adminStudentRouter = express.Router();

adminStudentRouter.get("/", adminAuth, getAllStudents);

export default adminStudentRouter;
