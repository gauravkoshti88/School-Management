import { useEffect, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getStaffDashboard } from "../../service/staff.service";
import { getLibraryDashboard } from "../../service/library.service";
import { useStaff } from "../../context/StaffContext";
import PageLoader from "../../components/PageLoader";

import PeonDashboard from "./PeonDashboard";

const getStatusClasses = (status) => {
  switch (status) {
    case "present":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "absent":
      return "bg-red-50 text-red-700 border-red-200";

    case "late":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "leave":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const formatStatus = (status) => {
  if (!status) {
    return "Not Marked";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "-";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) {
    return "-";
  }

  return time;
};

const StaffDashboard = () => {
  const navigate = useNavigate();

  const { staff, loading: staffLoading, fullName } = useStaff();

  const staffType = staff?.staffType;

  if (staffLoading) {
    return <PageLoader />;
  }

  if (staffType === "library") {
    return <LibrarianDashboard fullName={fullName} />;
  }

  if (staffType === "peon") {
    return <PeonDashboard fullName={fullName} />;
  }

  return (
    <TeacherDashboard staff={staff} fullName={fullName} navigate={navigate} />
  );
};

// Teacher Dashboard
const TeacherDashboard = ({ staff, fullName, navigate }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    leaveToday: 0,
    attendancePercentage: 0,
  });

  const [staffAttendance, setStaffAttendance] = useState({
    today: null,
    statistics: {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      attendancePercentage: 0,
    },
    history: [],
  });

  const [assignedClass, setAssignedClass] = useState(
    staff?.assignedClass || null,
  );

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (staff?.assignedClass) {
      setAssignedClass(staff.assignedClass);
    }
  }, [staff?.assignedClass]);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);

        const dashboardResponse = await getStaffDashboard();

        if (!dashboardResponse?.success) {
          throw new Error(
            dashboardResponse?.message || "Unable to fetch dashboard data.",
          );
        }

        if (!mounted) {
          return;
        }

        const stats = dashboardResponse.stats || {};

        setDashboardStats({
          totalStudents: stats.totalStudents || 0,
          presentToday: stats.presentToday || 0,
          absentToday: stats.absentToday || 0,
          leaveToday: stats.leaveToday || 0,
          attendancePercentage: stats.attendancePercentage || 0,
        });

        const responseAssignedClass =
          dashboardResponse.assignedClass ||
          dashboardResponse.staff?.assignedClass ||
          dashboardResponse.teacher?.assignedClass ||
          stats.assignedClass ||
          null;

        if (responseAssignedClass) {
          setAssignedClass(responseAssignedClass);
        }

        const attendanceResponse = dashboardResponse.staffAttendance || {};

        setStaffAttendance({
          today: attendanceResponse.today || null,

          statistics: {
            totalDays: attendanceResponse.statistics?.totalDays || 0,

            presentDays: attendanceResponse.statistics?.presentDays || 0,

            absentDays: attendanceResponse.statistics?.absentDays || 0,

            lateDays: attendanceResponse.statistics?.lateDays || 0,

            leaveDays: attendanceResponse.statistics?.leaveDays || 0,

            attendancePercentage:
              attendanceResponse.statistics?.attendancePercentage || 0,
          },

          history: attendanceResponse.history || [],
        });
      } catch (error) {
        console.error("Get staff dashboard error:", error);

        if (mounted) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Unable to load dashboard.",
          );
        }
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (dashboardLoading) {
    return <PageLoader />;
  }

  const className = assignedClass?.name || "Not Assigned";

  const section = assignedClass?.section || "-";

  const academicYear = assignedClass?.academicYear || "-";

  const roomNumber = assignedClass?.roomNumber || "Not Assigned";

  const capacity = assignedClass?.capacity || 0;

  const subjects = assignedClass?.subjects || [];

  const teacherName = fullName || "Teacher";

  const ownAttendanceStats = staffAttendance.statistics;

  const ownTodayAttendance = staffAttendance.today;

  const ownAttendanceHistory = staffAttendance.history || [];

  const calendarYear = calendarMonth.getFullYear();

  const calendarMonthIndex = calendarMonth.getMonth();

  const monthName = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();

  const daysInMonth = new Date(
    calendarYear,
    calendarMonthIndex + 1,
    0,
  ).getDate();

  const attendanceMap = ownAttendanceHistory.reduce((map, record) => {
    const date = new Date(record.date);

    if (
      date.getFullYear() === calendarYear &&
      date.getMonth() === calendarMonthIndex
    ) {
      map[date.getDate()] = record.status;
    }

    return map;
  }, {});

  const calendarDays = Array.from(
    {
      length: daysInMonth,
    },
    (_, index) => index + 1,
  );

  const previousMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1));
  };

  const stats = [
    {
      label: "Total Students",
      value: dashboardStats.totalStudents,
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Today's Attendance",
      value: `${dashboardStats.attendancePercentage}%`,
      icon: CalendarCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Class Capacity",
      value: capacity,
      icon: GraduationCap,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const quickActions = [
    {
      title: "Add New Student",
      description: "Add a student to your assigned class.",
      icon: Plus,
      path: "/staff/students",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Take Attendance",
      description: "Mark today's student attendance.",
      icon: ClipboardList,
      path: "/staff/attendance",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "View Students",
      description: "View students from your assigned class.",
      icon: Users,
      path: "/staff/students",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {teacherName}.
        </p>
      </div>

      {!assignedClass ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <GraduationCap size={22} />
            </div>

            <div>
              <h2 className="font-bold text-amber-900">No Class Assigned</h2>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                You have not been assigned to any class yet. Please contact the
                school administrator.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-indigo-600 shadow-sm">
          <div className="p-6 sm:p-7">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                  <GraduationCap size={21} />
                </div>

                <span className="text-sm font-medium text-indigo-100">
                  My Assigned Class
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                {className} - {section}
              </h2>

              <p className="mt-2 text-sm text-indigo-100">
                Academic Year {academicYear}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            <div className="border-r border-white/10 p-4">
              <p className="text-xs text-indigo-100">Section</p>

              <p className="mt-1 font-semibold text-white">{section}</p>
            </div>

            <div className="border-r border-white/10 p-4">
              <p className="text-xs text-indigo-100">Room</p>

              <p className="mt-1 font-semibold text-white">{roomNumber}</p>
            </div>

            <div className="border-r border-white/10 p-4">
              <p className="text-xs text-indigo-100">Class Teacher</p>

              <p className="mt-1 font-semibold text-white">{teacherName}</p>
            </div>

            <div className="p-4">
              <p className="text-xs text-indigo-100">Capacity</p>

              <p className="mt-1 font-semibold text-white">
                {capacity} Students
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Attendance</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your attendance for {monthName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="min-w-32 rounded-lg bg-slate-50 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 sm:min-w-36 sm:text-sm">
              {monthName}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Present
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Absent
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

            <span className="text-[11px] font-medium text-slate-600">Late</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Leave
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

            <span className="text-[11px] font-medium text-slate-600">
              Not Marked
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-1.5 text-center text-[10px] font-semibold text-slate-400 sm:text-xs"
            >
              {day}
            </div>
          ))}

          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="h-9 sm:h-10" />
          ))}

          {calendarDays.map((day) => {
            const status = attendanceMap[day];

            let dayClass = "border-slate-100 bg-slate-50 text-slate-600";

            if (status === "present") {
              dayClass = "border-emerald-500 bg-emerald-500 text-white";
            }

            if (status === "absent") {
              dayClass = "border-red-500 bg-red-500 text-white";
            }

            if (status === "late") {
              dayClass = "border-amber-400 bg-amber-400 text-white";
            }

            if (status === "leave") {
              dayClass = "border-blue-500 bg-blue-500 text-white";
            }

            return (
              <div
                key={day}
                title={
                  status
                    ? `${day} ${monthName} - ${formatStatus(status)}`
                    : `${day} ${monthName} - Not Marked`
                }
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition sm:h-10 sm:w-10 ${dayClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            My Attendance Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your staff attendance summary.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-indigo-700">Attendance</p>

            <p className="mt-2 text-2xl font-bold text-indigo-900">
              {ownAttendanceStats.attendancePercentage}%
            </p>

            <p className="mt-1 text-xs text-indigo-600">Overall attendance</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Present</p>

            <p className="mt-2 text-2xl font-bold text-emerald-900">
              {ownAttendanceStats.presentDays}
            </p>

            <p className="mt-1 text-xs text-emerald-600">Days present</p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Absent</p>

            <p className="mt-2 text-2xl font-bold text-red-900">
              {ownAttendanceStats.absentDays}
            </p>

            <p className="mt-1 text-xs text-red-600">Days absent</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Late</p>

            <p className="mt-2 text-2xl font-bold text-amber-900">
              {ownAttendanceStats.lateDays}
            </p>

            <p className="mt-1 text-xs text-amber-600">Late days</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Leave</p>

            <p className="mt-2 text-2xl font-bold text-blue-900">
              {ownAttendanceStats.leaveDays}
            </p>

            <p className="mt-1 text-xs text-blue-600">Leave days</p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Today's Attendance</h2>

              <p className="text-xs text-slate-500">
                {formatDate(ownTodayAttendance?.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {ownTodayAttendance ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Attendance Status</p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      ownTodayAttendance.status,
                    )}`}
                  >
                    {formatStatus(ownTodayAttendance.status)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Attendance ID</p>

                  <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-slate-600">
                    {ownTodayAttendance._id || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LogIn size={17} />

                    <span className="text-sm font-medium">Check In</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatTime(ownTodayAttendance.checkIn)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LogOut size={17} />

                    <span className="text-sm font-medium">Check Out</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatTime(ownTodayAttendance.checkOut)}
                  </p>
                </div>
              </div>

              {ownTodayAttendance.remarks && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ClipboardList size={17} />

                    <span className="text-sm font-medium">Remarks</span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {ownTodayAttendance.remarks}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <CalendarDays size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                Attendance not marked
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Your attendance for today has not been marked yet.
              </p>
            </div>
          )}
        </div>
      </section>
      {assignedClass && (
        <>
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Class Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quick overview of your assigned class.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{stat.label}</p>

                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Present Today
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {dashboardStats.presentToday}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">Absent Today</p>

                <p className="mt-1 text-2xl font-bold text-red-900">
                  {dashboardStats.absentToday}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-700">
                  Leave Today
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-900">
                  {dashboardStats.leaveToday}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">Subjects</h2>

              <p className="mt-1 text-sm text-slate-500">
                Subjects assigned to your class.
              </p>
            </div>

            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <div
                    key={subject._id || subject.code}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {subject.name}
                        </h3>

                        <p className="mt-1 text-xs font-medium uppercase text-indigo-600">
                          {subject.code}
                        </p>
                      </div>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {subject.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span>Max Marks: {subject.maxMarks}</span>

                      <span>Pass: {subject.passingMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  No subjects assigned to this class.
                </p>
              </div>
            )}
          </section>
        </>
      )}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access your most used teacher activities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => navigate(action.path)}
                disabled={!assignedClass}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconBg} ${action.iconColor}`}
                  >
                    <Icon size={21} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  {action.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// Librarian Dashboard
const LibrarianDashboard = ({ fullName }) => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalStudents: 0,
      totalIssued: 0,
      totalReturned: 0,
      totalOverdue: 0,
    },

    attendance: {
      today: null,

      statistics: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 0,
        attendancePercentage: 0,
      },

      history: [],
    },
  });

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    let mounted = true;

    const fetchLibraryDashboard = async () => {
      try {
        setDashboardLoading(true);

        const response = await getLibraryDashboard();

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to fetch library dashboard.",
          );
        }

        if (!mounted) {
          return;
        }

        setDashboardData({
          statistics: {
            totalStudents: response.statistics?.totalStudents || 0,

            totalIssued: response.statistics?.totalIssued || 0,

            totalReturned: response.statistics?.totalReturned || 0,

            totalOverdue: response.statistics?.totalOverdue || 0,
          },

          attendance: {
            today: response.attendance?.today || null,

            statistics: {
              totalDays: response.attendance?.statistics?.totalDays || 0,

              presentDays: response.attendance?.statistics?.presentDays || 0,

              absentDays: response.attendance?.statistics?.absentDays || 0,

              lateDays: response.attendance?.statistics?.lateDays || 0,

              leaveDays: response.attendance?.statistics?.leaveDays || 0,

              attendancePercentage:
                response.attendance?.statistics?.attendancePercentage || 0,
            },

            history: response.attendance?.history || [],
          },
        });
      } catch (error) {
        console.error("Get library dashboard error:", error);

        if (mounted) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Unable to load library dashboard.",
          );
        }
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    };

    fetchLibraryDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (dashboardLoading) {
    return <PageLoader />;
  }

  const stats = dashboardData.statistics;

  const attendance = dashboardData.attendance;

  const attendanceStats = attendance.statistics;

  const todayAttendance = attendance.today;

  const attendanceHistory = attendance.history || [];

  const calendarYear = calendarMonth.getFullYear();

  const calendarMonthIndex = calendarMonth.getMonth();

  const monthName = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();

  const daysInMonth = new Date(
    calendarYear,
    calendarMonthIndex + 1,
    0,
  ).getDate();

  const attendanceMap = attendanceHistory.reduce((map, record) => {
    const date = new Date(record.date);

    if (
      date.getFullYear() === calendarYear &&
      date.getMonth() === calendarMonthIndex
    ) {
      map[date.getDate()] = record.status;
    }

    return map;
  }, {});

  const calendarDays = Array.from(
    {
      length: daysInMonth,
    },
    (_, index) => index + 1,
  );

  const previousMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1));
  };

  const libraryStats = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Books Issued",
      value: stats.totalIssued,
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Books Returned",
      value: stats.totalReturned,
      icon: RotateCcw,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Overdue Books",
      value: stats.totalOverdue,
      icon: CalendarCheck,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Library Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {fullName || "Librarian"}.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl bg-indigo-600 shadow-sm">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <BookOpen size={24} />
            </div>

            <div>
              <p className="text-sm font-medium text-indigo-100">
                Library Management
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {fullName || "Librarian"}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
          <div className="border-r border-white/10 p-4">
            <p className="text-xs text-indigo-100">Total Students</p>

            <p className="mt-1 font-semibold text-white">
              {stats.totalStudents}
            </p>
          </div>

          <div className="border-r border-white/10 p-4">
            <p className="text-xs text-indigo-100">Currently Issued</p>

            <p className="mt-1 font-semibold text-white">{stats.totalIssued}</p>
          </div>

          <div className="border-r border-white/10 p-4">
            <p className="text-xs text-indigo-100">Returned</p>

            <p className="mt-1 font-semibold text-white">
              {stats.totalReturned}
            </p>
          </div>

          <div className="p-4">
            <p className="text-xs text-indigo-100">Overdue</p>

            <p className="mt-1 font-semibold text-white">
              {stats.totalOverdue}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Attendance Calendar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your attendance for {monthName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previousMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="min-w-32 rounded-lg bg-slate-50 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 sm:min-w-36 sm:text-sm">
              {monthName}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Present
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Absent
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

            <span className="text-[11px] font-medium text-slate-600">Late</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <span className="text-[11px] font-medium text-slate-600">
              Leave
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

            <span className="text-[11px] font-medium text-slate-600">
              Not Marked
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-1.5 text-center text-[10px] font-semibold text-slate-400 sm:text-xs"
            >
              {day}
            </div>
          ))}

          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div key={`empty-${index}`} className="h-9 sm:h-10" />
          ))}

          {calendarDays.map((day) => {
            const status = attendanceMap[day];

            let dayClass = "border-slate-100 bg-slate-50 text-slate-600";

            if (status === "present") {
              dayClass = "border-emerald-500 bg-emerald-500 text-white";
            }

            if (status === "absent") {
              dayClass = "border-red-500 bg-red-500 text-white";
            }

            if (status === "late") {
              dayClass = "border-amber-400 bg-amber-400 text-white";
            }

            if (status === "leave") {
              dayClass = "border-blue-500 bg-blue-500 text-white";
            }

            return (
              <div
                key={day}
                title={
                  status
                    ? `${day} ${monthName} - ${formatStatus(status)}`
                    : `${day} ${monthName} - Not Marked`
                }
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition sm:h-10 sm:w-10 ${dayClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Attendance Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your staff attendance summary.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-indigo-700">Attendance</p>

            <p className="mt-2 text-2xl font-bold text-indigo-900">
              {attendanceStats.attendancePercentage}%
            </p>

            <p className="mt-1 text-xs text-indigo-600">Overall attendance</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Present</p>

            <p className="mt-2 text-2xl font-bold text-emerald-900">
              {attendanceStats.presentDays}
            </p>

            <p className="mt-1 text-xs text-emerald-600">Days present</p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Absent</p>

            <p className="mt-2 text-2xl font-bold text-red-900">
              {attendanceStats.absentDays}
            </p>

            <p className="mt-1 text-xs text-red-600">Days absent</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700">Late</p>

            <p className="mt-2 text-2xl font-bold text-amber-900">
              {attendanceStats.lateDays}
            </p>

            <p className="mt-1 text-xs text-amber-600">Late days</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Leave</p>

            <p className="mt-2 text-2xl font-bold text-blue-900">
              {attendanceStats.leaveDays}
            </p>

            <p className="mt-1 text-xs text-blue-600">Leave days</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Today's Attendance</h2>

              <p className="text-xs text-slate-500">
                {formatDate(todayAttendance?.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {todayAttendance ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Attendance Status</p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      todayAttendance.status,
                    )}`}
                  >
                    {formatStatus(todayAttendance.status)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Attendance ID</p>

                  <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-slate-600">
                    {todayAttendance._id || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LogIn size={17} />

                    <span className="text-sm font-medium">Check In</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatTime(todayAttendance.checkIn)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LogOut size={17} />

                    <span className="text-sm font-medium">Check Out</span>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatTime(todayAttendance.checkOut)}
                  </p>
                </div>
              </div>

              {todayAttendance.remarks && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ClipboardList size={17} />

                    <span className="text-sm font-medium">Remarks</span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {todayAttendance.remarks}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <CalendarDays size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                Attendance not marked
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Your attendance for today has not been marked yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Library Overview</h2>

          <p className="mt-1 text-sm text-slate-500">
            Current library activity overview.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {libraryStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Library Actions</h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage student library records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/staff/students")}
          className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:max-w-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Users size={21} />
            </div>

            <ArrowRight
              size={18}
              className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
            />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">Manage Students</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            View students and manage their issued and returned library books.
          </p>
        </button>
      </section>
    </div>
  );
};

export default StaffDashboard;
