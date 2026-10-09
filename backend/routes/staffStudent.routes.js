import express from "express";

import {
  createStaffStudent,
  deleteStaffStudent,
  getStaffStudentById,
  getStaffStudents,
  updateStaffStudent,
  uploadStaffStudentProfileImage,
} from "../controllers/staffStudent.controller.js";

import staffAuth from "../middleware/staffAuth.js";
import upload from "../middleware/upload.js";

const staffStudentRouter = express.Router();

staffStudentRouter.use(staffAuth);

staffStudentRouter.post("/", createStaffStudent);

staffStudentRouter.get("/", getStaffStudents);

staffStudentRouter.get("/:studentId", getStaffStudentById);

staffStudentRouter.put("/:studentId", updateStaffStudent);

staffStudentRouter.post(
  "/:studentId/profile-image",
  upload.single("image"),
  uploadStaffStudentProfileImage,
);

staffStudentRouter.delete("/:studentId", deleteStaffStudent);

export default staffStudentRouter;
