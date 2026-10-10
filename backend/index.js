import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
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

const app = express();
const port = process.env.PORT || 3800;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("Server Running");
});

app.use("/api/website", websiteRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/staff/peon/dashboard", peonDashboardRouter);
app.use("/api/staff", staffRouter);
app.use("/api/admin/staff-attendance", staffAttendanceRouter);
app.use("/api/admin/students", adminStudentRouter);
app.use("/api/classes", classRouter);
app.use("/api/auth", authRouter);
app.use("/api/staff/students", staffStudentRouter);
app.use("/api/staff/attendance", studentAttendanceRouter);
app.use("/api/staff/dashboard", staffDashboardRouter);
app.use("/api/library", libraryRouter);
app.use("/api/auth/student", studentAuthRouter);
app.use("/api/student/dashboard", studentDashboardRouter);

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(port, () => {
      console.log(`Server is running on port ${port} 🚀`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
