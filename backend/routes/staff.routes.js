import express from "express";

import {
  createLibraryStaff,
  createPeonStaff,
  createTeacher,
  deleteLibraryStaff,
  deletePeonStaff,
  deleteTeacher,
  getLibraryStaff,
  getLibraryStaffById,
  getPeonStaff,
  getPeonStaffById,
  getTeacher,
  getTeachers,
  updateLibraryStaff,
  updatePeonStaff,
  updateTeacher,
  uploadLibraryStaffProfileImage,
  uploadPeonStaffProfileImage,
  uploadTeacherProfileImage,
} from "../controllers/staff.controller.js";

import adminAuth from "../middleware/adminAuth.middleware.js";
import upload from "../middleware/upload.js";

const staffRouter = express.Router();

// Teacher
staffRouter.post("/teacher", adminAuth, createTeacher);

staffRouter.get("/teachers", adminAuth, getTeachers);

staffRouter.get("/teacher/:id", adminAuth, getTeacher);

staffRouter.put("/teacher/:id", adminAuth, updateTeacher);

staffRouter.post(
  "/teacher/:id/profile-image",
  adminAuth,
  upload.single("image"),
  uploadTeacherProfileImage,
);

staffRouter.delete("/teacher/:id", adminAuth, deleteTeacher);

// Peon Staff
staffRouter.post("/peon", adminAuth, createPeonStaff);

staffRouter.get("/peons", adminAuth, getPeonStaff);

staffRouter.get("/peon/:id", adminAuth, getPeonStaffById);

staffRouter.put("/peon/:id", adminAuth, updatePeonStaff);

staffRouter.post(
  "/peon/:id/profile-image",
  adminAuth,
  upload.single("image"),
  uploadPeonStaffProfileImage,
);

staffRouter.delete("/peon/:id", adminAuth, deletePeonStaff);

// Library Staff
staffRouter.post("/library", adminAuth, createLibraryStaff);

staffRouter.get("/libraries", adminAuth, getLibraryStaff);

staffRouter.get("/library/:id", adminAuth, getLibraryStaffById);

staffRouter.put("/library/:id", adminAuth, updateLibraryStaff);

staffRouter.post(
  "/library/:id/profile-image",
  adminAuth,
  upload.single("image"),
  uploadLibraryStaffProfileImage,
);

staffRouter.delete("/library/:id", adminAuth, deleteLibraryStaff);

export default staffRouter;
