import { CalendarDays, Users } from "lucide-react";

const AttendanceFilters = ({
  date,
  staffType,
  staffTypes,
  onDateChange,
  onStaffTypeChange,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="attendance-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Attendance Date
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="staff-type"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Staff Type
          </label>

          <div className="relative">
            <Users
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="staff-type"
              value={staffType}
              onChange={(event) => onStaffTypeChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select Staff Type</option>

              {staffTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;
