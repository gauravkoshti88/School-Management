import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnect } from "./config/dbConnection.js";

import adminRouter from "./routes/admin.routes.js";
import staffRouter from "./routes/staff.routes.js";
import classRouter from "./routes/class.routes.js";
import authRouter from "./routes/auth.routes.js";
import staffStudentRouter from "./routes/staffStudent.routes.js";
import staffAttendanceRouter from "./routes/staffAttendance.routes.js";
import staffDashboardRouter from "./routes/staffDashboard.routes.js";
import peonDashboardRouter from "./routes/peonDashboard.routes.js";
import adminDashboardRouter from "./routes/adminDashboard.routes.js";
import adminStudentRouter from "./routes/adminStudent.routes.js";
import studentAuthRouter from "./routes/studentAuth.routes.js";
import studentDashboardRouter from "./routes/studentDashboard.routes.js";
import websiteRouter from "./routes/website.routes.js";
import studentAttendanceRouter from "./routes/studentAttendance.routes.js";
import libraryRouter from "./routes/library.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Test Routes
app.get("/", async (req, res) => {
  res.send("Server Runnig");
});

app.use("/api/website", websiteRouter);

app.use("/api/admin", adminRouter);

app.use("/api/admin/dashboard", adminDashboardRouter);

// Peon dashboard
app.use("/api/staff/peon/dashboard", peonDashboardRouter);

app.use("/api/staff", staffRouter);

// Admin staff attendance
app.use("/api/admin/staff-attendance", staffAttendanceRouter);

app.use("/api/admin/students", adminStudentRouter);

app.use("/api/classes", classRouter);

app.use("/api/auth", authRouter);

// Teacher student management
app.use("/api/staff/students", staffStudentRouter);

// Teacher student attendance
app.use("/api/staff/attendance", studentAttendanceRouter);

// Staff dashboard
app.use("/api/staff/dashboard", staffDashboardRouter);

// Library
app.use("/api/library", libraryRouter);

app.use("/api/auth/student", studentAuthRouter);

app.use("/api/student/dashboard", studentDashboardRouter);

app.listen(port, () => {
  dbConnect();

  console.log(`Server is running on http://localhost:${port}`);
});
