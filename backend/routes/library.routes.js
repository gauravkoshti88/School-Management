import express from "express";

import {
  deleteLibraryBook,
  getLibraryClasses,
  getLibraryDashboard,
  getLibraryStudentById,
  getLibraryStudents,
  issueBook,
  receiveBook,
  updateLibraryBook,
} from "../controllers/library.controller.js";
import staffAuth from "../middleware/staffAuth.js";

const libraryRouter = express.Router();

libraryRouter.use(staffAuth);

// Library dashboard
libraryRouter.get("/dashboard", getLibraryDashboard);

// Get all classes
libraryRouter.get("/classes", getLibraryClasses);

// Get students by class
libraryRouter.get("/students", getLibraryStudents);

// Get particular student
libraryRouter.get("/students/:studentId", getLibraryStudentById);

// Issue book
libraryRouter.post("/students/:studentId/books", issueBook);

// Update book record
libraryRouter.put(
  "/students/:studentId/books/:libraryBookId",
  updateLibraryBook,
);

// Receive book
libraryRouter.patch(
  "/students/:studentId/books/:libraryBookId/receive",
  receiveBook,
);

// Delete book history
libraryRouter.delete(
  "/students/:studentId/books/:libraryBookId",
  deleteLibraryBook,
);

export default libraryRouter;
