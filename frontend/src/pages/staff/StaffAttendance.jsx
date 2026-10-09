import { useEffect, useMemo, useState } from "react";

import { CalendarCheck, Check, Clock, UserRound, X } from "lucide-react";

import toast from "react-hot-toast";

import {
  getTodayAttendance,
  markAttendance,
} from "../../service/attendance.service";

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStudentInitials = (student) => {
  const firstName = student?.firstName?.trim()?.[0] || "";

  const lastName = student?.lastName?.trim()?.[0] || "";

  return `${firstName}${lastName}`.toUpperCase() || "S";
};

const StaffAttendance = () => {
  const [date, setDate] = useState(getTodayDate());

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const response = await getTodayAttendance(date);

      setRecords(response.records || []);
    } catch (error) {
      console.error("Get attendance error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load attendance.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const updateStatus = (studentId, status) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.student._id === studentId
          ? {
              ...record,
              status,
            }
          : record,
      ),
    );
  };

  const markAll = (status) => {
    setRecords((previous) =>
      previous.map((record) => ({
        ...record,
        status,
      })),
    );
  };

  const handleSave = async () => {
    const incomplete = records.some((record) => !record.status);

    if (incomplete) {
      toast.error("Please mark attendance for every student.");

      return;
    }

    try {
      setSaving(true);

      await markAttendance({
        date,
        records: records.map((record) => ({
          studentId: record.student._id,
          status: record.status,
        })),
      });

      toast.success("Attendance saved successfully.");

      await fetchAttendance();
    } catch (error) {
      console.error("Save attendance error:", error);

      toast.error(
        error.response?.data?.message || "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const total = records.length;

    const present = records.filter(
      (record) => record.status === "present",
    ).length;

    const absent = records.filter(
      (record) => record.status === "absent",
    ).length;

    const leave = records.filter((record) => record.status === "leave").length;

    const percentage = total ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      leave,
      percentage,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage attendance for your assigned class.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-600">Present</p>

          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {summary.present}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-medium text-red-600">Absent</p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {summary.absent}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600">Attendance</p>

          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.percentage}%
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <CalendarCheck size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Daily Attendance</h2>

              <p className="mt-1 text-sm text-slate-500">
                Select date and mark attendance.
              </p>
            </div>
          </div>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
          <button
            type="button"
            onClick={() => markAll("present")}
            className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Mark All Present
          </button>

          <button
            type="button"
            onClick={() => markAll("absent")}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            Mark All Absent
          </button>

          <button
            type="button"
            onClick={() => markAll("leave")}
            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            Mark All Leave
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading attendance...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center">
            <UserRound size={40} className="mx-auto text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No students found.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add students to your class first.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <th className="px-5 py-3">Roll No.</th>

                    <th className="px-5 py-3">Student</th>

                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => {
                    const student = record.student;

                    return (
                      <tr
                        key={student._id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          {student.rollNumber}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                              {student.profileImage?.url ? (
                                <img
                                  src={student.profileImage.url}
                                  alt={
                                    student.profileImage.alt ||
                                    `${student.firstName} ${student.lastName} profile image`
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getStudentInitials(student)
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {student.firstName} {student.lastName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(student._id, "present")
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                record.status === "present"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              <Check size={14} />
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(student._id, "absent")
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                record.status === "absent"
                                  ? "bg-red-600 text-white"
                                  : "bg-red-50 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              <X size={14} />
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStatus(student._id, "leave")}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                record.status === "leave"
                                  ? "bg-amber-600 text-white"
                                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              <Clock size={14} />
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default StaffAttendance;
