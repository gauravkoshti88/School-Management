import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  LogOut,
  MapPin,
  Phone,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLoader from "../../components/PageLoader";
import { useWebsite } from "../../context/WebsiteContext";
import {
  getStudentDashboard,
  studentLogout,
} from "../../service/studentAuth.service";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { website } = useWebsite();

  const [student, setStudent] = useState(null);

  const [attendance, setAttendance] = useState({
    summary: {
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
      percentage: 0,
    },
    records: [],
  });

  const [library, setLibrary] = useState({
    summary: {
      total: 0,
      issued: 0,
      returned: 0,
      overdue: 0,
    },
    currentlyIssued: [],
  });

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const logo = website?.lightLogo?.url || website?.darkLogo?.url || "";

  const websiteName = website?.websiteName || "School Management System";

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await getStudentDashboard();

      setStudent(response.student);

      setAttendance(
        response.attendance || {
          summary: {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0,
            percentage: 0,
          },
          records: [],
        },
      );

      setLibrary(
        response.library || {
          summary: {
            total: 0,
            issued: 0,
            returned: 0,
            overdue: 0,
          },
          currentlyIssued: [],
        },
      );
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/student/login", {
          replace: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await studentLogout();
    } catch (error) {
      console.error("Student logout error:", error);
    } finally {
      navigate("/student/login", {
        replace: true,
      });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!student) {
    return null;
  }

  const classInfo = student.classId;

  const fullName = `${student.firstName || ""} ${
    student.lastName || ""
  }`.trim();

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

  const attendanceMap = attendance.records.reduce((map, record) => {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white">
              {logo ? (
                <img
                  src={logo}
                  alt={website?.lightLogo?.alt || websiteName}
                  className="h-full w-full bg-white object-contain p-1"
                />
              ) : (
                <GraduationCap size={22} />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                Student Portal
              </p>

              <p className="truncate text-xs text-slate-400">{websiteName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600 disabled:opacity-60"
          >
            <LogOut size={17} />

            <span className="hidden sm:block">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-indigo-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-indigo-200">
                Welcome back
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {fullName}
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                {classInfo?.name || "Class"}{" "}
                {classInfo?.section ? `• Section ${classInfo.section}` : ""}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs text-indigo-200">Attendance</p>

              <p className="mt-1 text-3xl font-bold">
                {attendance.summary.percentage}%
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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

              if (status === "leave") {
                dayClass = "border-amber-400 bg-amber-400 text-white";
              }

              return (
                <div
                  key={day}
                  title={
                    status
                      ? `${day} ${monthName} - ${status}`
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

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AttendanceCard
            title="Total Days"
            value={attendance.summary.total}
            icon={<CalendarDays size={20} />}
          />

          <AttendanceCard
            title="Present"
            value={attendance.summary.present}
            icon={<CheckCircle2 size={20} />}
          />

          <AttendanceCard
            title="Absent"
            value={attendance.summary.absent}
            icon={<XCircle size={20} />}
          />

          <AttendanceCard
            title="Leave"
            value={attendance.summary.leave}
            icon={<Clock3 size={20} />}
          />
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <LibraryCard
            title="Total Books"
            value={library.summary.total}
            icon={<BookOpen size={20} />}
          />

          <LibraryCard
            title="Currently Issued"
            value={library.summary.issued}
            icon={<BookOpen size={20} />}
          />

          <LibraryCard
            title="Returned"
            value={library.summary.returned}
            icon={<CheckCircle2 size={20} />}
          />

          <LibraryCard
            title="Overdue"
            value={library.summary.overdue}
            icon={<Clock3 size={20} />}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Student Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your registered school information
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <InfoItem
                icon={<UserRound size={18} />}
                label="Full Name"
                value={fullName}
              />

              <InfoItem
                icon={<GraduationCap size={18} />}
                label="Admission Number"
                value={student.admissionNumber}
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Roll Number"
                value={student.rollNumber}
              />

              <InfoItem
                icon={<GraduationCap size={18} />}
                label="Class"
                value={
                  classInfo
                    ? `${classInfo.name} - Section ${classInfo.section}`
                    : "Not Assigned"
                }
              />

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Academic Year"
                value={classInfo?.academicYear || "Not Available"}
              />

              <InfoItem
                icon={<UserRound size={18} />}
                label="Gender"
                value={student.gender}
              />

              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Date of Birth"
                value={
                  student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString("en-IN")
                    : "Not Available"
                }
              />

              <InfoItem
                icon={<Phone size={18} />}
                label="Phone"
                value={student.phone || "Not Available"}
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Father Name"
                value={student.fatherName}
              />

              <InfoItem
                icon={<Users size={18} />}
                label="Mother Name"
                value={student.motherName}
              />

              <InfoItem
                icon={<MapPin size={18} />}
                label="Address"
                value={student.address || "Not Available"}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Attendance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your overall attendance
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-center">
                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-[12px] border-indigo-100">
                  <span className="text-3xl font-bold text-indigo-600">
                    {attendance.summary.percentage}%
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    Attendance
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <AttendanceRow
                  label="Present"
                  value={attendance.summary.present}
                />

                <AttendanceRow
                  label="Absent"
                  value={attendance.summary.absent}
                />

                <AttendanceRow label="Leave" value={attendance.summary.leave} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <BookOpen size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Currently Issued Books
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Books currently issued to you
                </p>
              </div>
            </div>
          </div>

          {library.currentlyIssued.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen size={38} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No books are currently issued.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your currently issued books will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {library.currentlyIssued.map((book) => (
                <IssuedBookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const AttendanceCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
};

const LibraryCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not Available"}
        </p>
      </div>
    </div>
  );
};

const AttendanceRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>

      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
};

const IssuedBookCard = ({ book }) => {
  const overdue = book.returnDate && new Date(book.returnDate) < new Date();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
            <BookOpen size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {book.bookName}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Issued on {formatDate(book.issueDate)}
            </p>
          </div>
        </div>

        <LibraryStatusBadge book={book} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DateItem label="Issue Date" value={book.issueDate} />

        <DateItem label="Due Date" value={book.returnDate} />
      </div>

      {book.remarks && (
        <div className="mt-4 rounded-xl bg-white px-3 py-2.5">
          <p className="text-xs font-medium text-slate-400">Remarks</p>

          <p className="mt-1 text-sm text-slate-600">{book.remarks}</p>
        </div>
      )}

      {overdue && (
        <div className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
          This book is overdue. Please return it to the library.
        </div>
      )}
    </div>
  );
};

const DateItem = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value ? formatDate(value) : "—"}
      </p>
    </div>
  );
};

const LibraryStatusBadge = ({ book }) => {
  const overdue =
    book.status === "issued" &&
    book.returnDate &&
    new Date(book.returnDate) < new Date();

  if (overdue) {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Overdue
      </span>
    );
  }

  if (book.status === "issued") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Issued
      </span>
    );
  }

  if (book.status === "returned") {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Returned
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {book.status || "Unknown"}
    </span>
  );
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default StudentDashboard;
