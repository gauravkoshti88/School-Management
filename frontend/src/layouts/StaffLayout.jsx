import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { staffLogout } from "../service/auth.service";
import { useWebsite } from "../context/WebsiteContext";
import { useStaff } from "../context/StaffContext";
import DocumentTitle from "../components/DocumentTitle";

const navigation = [
  {
    label: "Dashboard",
    path: "/staff/dashboard",
    icon: LayoutDashboard,
    roles: ["teacher", "peon", "library"],
  },
  {
    label: "Students",
    path: "/staff/students",
    icon: Users,
    roles: ["teacher", "library"],
  },
  {
    label: "Attendance",
    path: "/staff/attendance",
    icon: CalendarDays,
    roles: ["teacher"],
  },
  {
    label: "Profile",
    path: "/staff/profile",
    icon: User,
    roles: ["teacher", "peon", "library"],
  },
];

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const { website } = useWebsite();

  const { staff, loading, fullName, initials, clearStaff } = useStaff();

  const websiteName = website?.websiteName || "School Management System";

  const logo = website?.darkLogo?.url || website?.lightLogo?.url || "";

  const logoAlt =
    website?.darkLogo?.alt || website?.lightLogo?.alt || websiteName;

  const profileImage = staff?.profileImage?.url || "";

  const profileImageAlt =
    staff?.profileImage?.alt || `${fullName || "Staff"} profile image`;

  const staffType =
    staff?.staffType === "teacher"
      ? "Teacher"
      : staff?.staffType === "peon"
        ? "Peon Staff"
        : staff?.staffType === "library"
          ? "Library Staff"
          : "School Staff";

  const staffNavigation = useMemo(() => {
    const currentStaffType = staff?.staffType;

    return navigation.filter((item) => item.roles.includes(currentStaffType));
  }, [staff?.staffType]);

  const handleLogout = async () => {
    try {
      await staffLogout();
    } catch (error) {
      console.error("Staff logout error:", error);
    } finally {
      clearStaff();

      navigate("/staff/login", {
        replace: true,
      });
    }
  };

  return (
    <>
      <DocumentTitle />

      <div className="min-h-screen bg-slate-50">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
            <NavLink
              to="/staff/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white">
                {logo ? (
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <School size={23} />
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-900">
                  {websiteName}
                </h1>

                <p className="text-xs text-slate-500">Staff Panel</p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {staffNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                {loading ? (
                  "S"
                ) : profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileImageAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || "S"
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {loading ? "Loading..." : fullName || "Staff Member"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {loading ? "Please wait" : staffType}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={19} />

              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              >
                <Menu size={24} />
              </button>

              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold text-slate-900">
                  {websiteName}
                </h2>

                <p className="text-sm text-slate-500">
                  Manage your school responsibilities
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {loading ? "Loading..." : fullName || "Staff Member"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {loading ? "Please wait" : staffType}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                  {loading ? (
                    "S"
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt={profileImageAlt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "S"
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

export default StaffLayout;
