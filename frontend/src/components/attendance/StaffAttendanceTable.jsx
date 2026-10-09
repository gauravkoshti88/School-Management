import { Check, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

const ATTENDANCE_OPTIONS = [
  {
    value: "present",
    label: "Present",
  },
  {
    value: "absent",
    label: "Absent",
  },
  {
    value: "late",
    label: "Late",
  },
  {
    value: "leave",
    label: "Leave",
  },
];

const getStaffInitials = (staff) => {
  const first = staff?.firstName?.trim()?.charAt(0) || "";

  const last = staff?.lastName?.trim()?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "S";
};

const getStaffFullName = (staff) => {
  return `${staff?.firstName || ""} ${staff?.lastName || ""}`.trim() || "Staff";
};

const StaffAttendanceTable = ({
  staff = [],
  staffTypeLabel = "Staff",
  saving = false,
  onStatusChange,
  onCheckInChange,
  onCheckOutChange,
  onRemarksChange,
  onMarkAllPresent,
  onSave,
}) => {
  const [search, setSearch] = useState("");

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return staff;
    }

    return staff.filter((member) => {
      const name = getStaffFullName(member).toLowerCase();

      const employeeId = member?.employeeId?.toLowerCase() || "";

      const email = member?.email?.toLowerCase() || "";

      return (
        name.includes(query) ||
        employeeId.includes(query) ||
        email.includes(query)
      );
    });
  }, [staff, search]);

  const markedCount = staff.filter((member) => member.attendanceMarked).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {staffTypeLabel}
              </h2>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                {staff.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage attendance for selected staff.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              onClick={onMarkAllPresent}
              disabled={saving || staff.length === 0}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={17} />
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserRound size={26} />
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-900">
            No active staff found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            No active {staffTypeLabel.toLowerCase()}s are available.
          </p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Search size={28} className="mx-auto text-slate-300" />

          <h3 className="mt-4 text-base font-bold text-slate-900">
            No staff found
          </h3>

          <p className="mt-1 text-sm text-slate-500">Try a different search.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Staff
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Employee ID
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Check In
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Check Out
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => {
                  const fullName = getStaffFullName(member);

                  return (
                    <tr
                      key={member._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                            {member.profileImage?.url ? (
                              <img
                                src={member.profileImage.url}
                                alt={
                                  member.profileImage.alt ||
                                  `${fullName} profile image`
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getStaffInitials(member)
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {fullName}
                            </p>

                            {member.email && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                          {member.employeeId || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="time"
                          value={member.attendance?.checkIn || ""}
                          onChange={(event) =>
                            onCheckInChange(member._id, event.target.value)
                          }
                          className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="time"
                          value={member.attendance?.checkOut || ""}
                          onChange={(event) =>
                            onCheckOutChange(member._id, event.target.value)
                          }
                          className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={member.attendance?.status || "present"}
                          onChange={(event) =>
                            onStatusChange(member._id, event.target.value)
                          }
                          className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                          {ATTENDANCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="text"
                          value={member.attendance?.remarks || ""}
                          onChange={(event) =>
                            onRemarksChange(member._id, event.target.value)
                          }
                          placeholder="Optional"
                          className="h-10 w-40 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredStaff.map((member) => {
              const fullName = getStaffFullName(member);

              return (
                <div key={member._id} className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                      {member.profileImage?.url ? (
                        <img
                          src={member.profileImage.url}
                          alt={
                            member.profileImage.alt ||
                            `${fullName} profile image`
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getStaffInitials(member)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {fullName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Employee ID: {member.employeeId || "—"}
                      </p>
                    </div>

                    {member.attendanceMarked && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                        Saved
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        Check In
                      </label>

                      <input
                        type="time"
                        value={member.attendance?.checkIn || ""}
                        onChange={(event) =>
                          onCheckInChange(member._id, event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        Check Out
                      </label>

                      <input
                        type="time"
                        value={member.attendance?.checkOut || ""}
                        onChange={(event) =>
                          onCheckOutChange(member._id, event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        Attendance
                      </label>

                      <select
                        value={member.attendance?.status || "present"}
                        onChange={(event) =>
                          onStatusChange(member._id, event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        {ATTENDANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        Remarks
                      </label>

                      <input
                        type="text"
                        value={member.attendance?.remarks || ""}
                        onChange={(event) =>
                          onRemarksChange(member._id, event.target.value)
                        }
                        placeholder="Optional"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {staff.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{markedCount}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{staff.length}</span>{" "}
            attendance records already saved.
          </p>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffAttendanceTable;
