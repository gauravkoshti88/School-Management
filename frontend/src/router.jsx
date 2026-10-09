import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import StaffProtectedRoute from "./components/StaffProtectedRoute";
import StudentProtectedRoute from "./components/StudentProtectedRoute";
import PageLoader from "./components/PageLoader";

const Home = lazy(() => import("./pages/Home"));

const AdminLogin = lazy(() => import("./pages/AuthPage"));

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

const Dashboard = lazy(() => import("./pages/admin/Dashboard"));

const Students = lazy(() => import("./pages/admin/Students"));

const Teachers = lazy(() => import("./pages/admin/Teachers"));

const PeonStaff = lazy(() => import("./pages/admin/PeonStaff"));

const LibraryStaff = lazy(() => import("./pages/admin/LibraryStaff"));

const Classes = lazy(() => import("./pages/admin/Classes"));

const StaffAttendance = lazy(() => import("./pages/admin/StaffAttendance"));

const WebsiteSettings = lazy(() => import("./pages/admin/WebsiteSettings"));

const StaffLogin = lazy(() => import("./pages/StaffAuthPage"));

const StaffLayout = lazy(() => import("./layouts/StaffLayout"));

const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));

const StaffStudents = lazy(() => import("./pages/staff/StaffStudents"));

const StaffAttendancePage = lazy(() => import("./pages/staff/StaffAttendance"));

const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

const StudentLogin = lazy(() => import("./pages/StudentAuthPage"));

const StudentLayout = lazy(() => import("./layouts/StudentLayout"));

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));

const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));

const StudentLibrary = lazy(() => import("./pages/student/StudentLibrary"));

const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  // Public home page
  {
    path: "/",
    element: withSuspense(<Home />),
  },

  // Admin login
  {
    path: "/admin/login",
    element: withSuspense(<AdminLogin />),
  },

  // Protected admin routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: withSuspense(<AdminLayout />),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "profile",
            element: withSuspense(<AdminProfile />),
          },

          // Dashboard
          {
            path: "dashboard",
            element: withSuspense(<Dashboard />),
          },

          // Students
          {
            path: "students",
            element: withSuspense(<Students />),
          },

          // Teachers
          {
            path: "teachers",
            element: withSuspense(<Teachers />),
          },

          // Peon Staff
          {
            path: "peons",
            element: withSuspense(<PeonStaff />),
          },

          // Library Staff
          {
            path: "library-staff",
            element: withSuspense(<LibraryStaff />),
          },

          // Staff Attendance
          {
            path: "staff-attendance",
            element: withSuspense(<StaffAttendance />),
          },

          // Classes
          {
            path: "classes",
            element: withSuspense(<Classes />),
          },

          // Website Settings
          {
            path: "website",
            element: withSuspense(<WebsiteSettings />),
          },
        ],
      },
    ],
  },

  // Staff login
  {
    path: "/staff/login",
    element: withSuspense(<StaffLogin />),
  },

  // Protected staff routes
  {
    element: <StaffProtectedRoute />,
    children: [
      {
        path: "/staff",
        element: withSuspense(<StaffLayout />),
        children: [
          {
            index: true,
            element: <Navigate to="/staff/dashboard" replace />,
          },

          {
            path: "dashboard",
            element: withSuspense(<StaffDashboard />),
          },

          {
            path: "students",
            element: withSuspense(<StaffStudents />),
          },

          {
            path: "attendance",
            element: withSuspense(<StaffAttendancePage />),
          },

          {
            path: "profile",
            element: withSuspense(<StaffProfile />),
          },
        ],
      },
    ],
  },

  // Student login
  {
    path: "/student/login",
    element: withSuspense(<StudentLogin />),
  },

  // Protected student routes
  {
    element: <StudentProtectedRoute />,
    children: [
      {
        path: "/student",
        element: withSuspense(<StudentLayout />),
        children: [
          {
            index: true,
            element: <Navigate to="/student/dashboard" replace />,
          },

          {
            path: "dashboard",
            element: withSuspense(<StudentDashboard />),
          },

          {
            path: "profile",
            element: withSuspense(<StudentProfile />),
          },

          {
            path: "library",
            element: withSuspense(<StudentLibrary />),
          },
        ],
      },
    ],
  },

  // Unknown routes
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
