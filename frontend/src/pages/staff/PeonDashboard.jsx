import { useCallback, useEffect, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import { useStaff } from "../../context/StaffContext";

import { getPeonDashboard } from "../../service/peonDashboard.service";

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

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const StatCard = ({ title, value, icon: Icon, description, iconClassName }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

const PeonDashboard = () => {
  const { staff, loading: staffLoading } = useStaff();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getPeonDashboard();

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load peon dashboard.");
      }

      setDashboard(response);
    } catch (error) {
      console.error("Fetch peon dashboard error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load peon dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!staffLoading && staff?._id) {
      fetchDashboard();
    }
  }, [staffLoading, staff?._id, fetchDashboard]);

  const todayAttendance = dashboard?.today?.attendance || null;

  const statistics = dashboard?.statistics || {};

  const todayStatus = todayAttendance?.status || null;

  const attendancePercentage = statistics.attendancePercentage ?? 0;

  const history = dashboard?.history || [];

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

  const attendanceMap = history.reduce((map, record) => {
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

  if (staffLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={30} className="animate-spin text-indigo-600" />

          <p className="text-sm font-medium">Loading peon dashboard...</p>
        </div>
      </div>
    );
  }

  if (!staff?._id) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">Staff session not found.</p>

        <p className="mt-1 text-sm text-red-600">Please login again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Peon Portal</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome, {staff.firstName || "Peon"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your attendance details.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          description="Overall attendance"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Present"
          value={statistics.presentDays || 0}
          description="Days present"
          icon={CheckCircle2}
          iconClassName="bg-green-50 text-green-600"
        />

        <StatCard
          title="Absent"
          value={statistics.absentDays || 0}
          description="Days absent"
          icon={XCircle}
          iconClassName="bg-red-50 text-red-600"
        />

        <StatCard
          title="Late"
          value={statistics.lateDays || 0}
          description="Late days"
          icon={Clock3}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarDays size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Today's Attendance</h2>

                <p className="text-xs text-slate-500">
                  {formatDate(dashboard?.today?.date || getTodayDate())}
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
                        todayStatus,
                      )}`}
                    >
                      {formatStatus(todayStatus)}
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
                      <FileText size={17} />

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
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Profile Summary</h2>

                <p className="text-xs text-slate-500">Your staff information</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Employee ID</span>

              <span className="text-sm font-semibold text-slate-900">
                {staff.employeeId || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Shift</span>

              <span className="text-sm font-semibold capitalize text-slate-900">
                {staff.shift || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Total Attendance</span>

              <span className="text-sm font-semibold text-slate-900">
                {statistics.totalDays || 0}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500">Leave Days</span>

              <span className="text-sm font-semibold text-slate-900">
                {statistics.leaveDays || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeonDashboard;
