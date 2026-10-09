import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import DocumentTitle from "../components/DocumentTitle";
import { useStudent } from "../context/StudentContext";
import { useWebsite } from "../context/WebsiteContext";
import { studentLogout } from "../service/studentAuth.service";

const navigation = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Library",
    path: "/student/library",
    icon: BookOpen,
  },
  {
    name: "My Profile",
    path: "/student/profile",
    icon: UserRound,
  },
];

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const navigate = useNavigate();

  const { website } = useWebsite();

  const { student, fullName, initials, profileImage, setStudent } =
    useStudent();

  const websiteName = website?.websiteName || "School Management System";

  const logo = website?.lightLogo?.url || website?.darkLogo?.url || "";

  const logoAlt =
    website?.lightLogo?.alt || website?.darkLogo?.alt || websiteName;

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);

      await studentLogout();

      setStudent(null);
    } catch (error) {
      console.error("Student logout error:", error);

      setStudent(null);
    } finally {
      navigate("/student/login", {
        replace: true,
      });
    }
  };

  return (
    <>
      <DocumentTitle />

      <div className="min-h-screen bg-slate-100">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
            <NavLink
              to="/student/dashboard"
              onClick={closeSidebar}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white">
                {logo ? (
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="h-full w-full bg-white object-contain p-1"
                  />
                ) : (
                  <School size={22} />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-900">
                  {websiteName}
                </h1>

                <p className="text-xs text-slate-500">Student Portal</p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Student Menu
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-600">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={
                      student?.profileImage?.alt || `${fullName} profile image`
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {fullName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {student?.admissionNumber || "Student"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={20} />

              <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="relative flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              >
                <Menu size={24} />
              </button>

              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold text-slate-900">
                  Student Portal
                </h2>

                <p className="text-sm text-slate-500">
                  Manage your school information
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {fullName}
                  </p>

                  <p className="text-xs text-slate-500">Student</p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-600">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={
                        student?.profileImage?.alt ||
                        `${fullName} profile image`
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default StudentLayout;
