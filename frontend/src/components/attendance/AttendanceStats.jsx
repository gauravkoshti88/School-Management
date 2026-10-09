import { CalendarDays, Check, Clock3, X } from "lucide-react";

const AttendanceStats = ({ present = 0, absent = 0, late = 0, leave = 0 }) => {
  const stats = [
    {
      label: "Present",
      value: present,
      icon: Check,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Absent",
      value: absent,
      icon: X,
      iconClass: "bg-red-50 text-red-600",
    },
    {
      label: "Late",
      value: late,
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "Leave",
      value: leave,
      icon: CalendarDays,
      iconClass: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconClass}`}
              >
                <Icon size={18} />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStats;
