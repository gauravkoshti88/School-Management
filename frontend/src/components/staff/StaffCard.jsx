import {
  BriefcaseBusiness,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

const THEMES = {
  teacher: {
    banner: "from-indigo-500 via-indigo-600 to-violet-600",
    bar: "lg:from-indigo-500 lg:to-violet-600",
    chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    icon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  },

  peon: {
    banner: "from-amber-400 via-orange-500 to-rose-500",
    bar: "lg:from-amber-400 lg:to-rose-500",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  },

  library: {
    banner: "from-emerald-400 via-teal-500 to-cyan-600",
    bar: "lg:from-emerald-400 lg:to-cyan-600",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  },

  default: {
    banner: "from-slate-500 via-slate-600 to-slate-700",
    bar: "lg:from-slate-500 lg:to-slate-700",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  },
};

const StaffCard = ({
  staff,
  type = "teacher",
  onEdit,
  onDelete,
  deleting = false,
}) => {
  if (!staff) {
    return null;
  }

  const fullName =
    `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
    "Unknown Staff";

  const initials =
    `${staff.firstName?.charAt(0) || ""}${
      staff.lastName?.charAt(0) || ""
    }`.toUpperCase() || "U";

  const isTeacher = type === "teacher";
  const isPeon = type === "peon";
  const isLibrary = type === "library";

  const theme = THEMES[type] || THEMES.default;

  const role = isTeacher
    ? staff.specialization || "Teacher"
    : isPeon
      ? "Peon Staff"
      : isLibrary
        ? staff.libraryRole || "Library Staff"
        : "Staff";

  const secondaryLabel = isTeacher
    ? "Department"
    : isPeon
      ? "Shift"
      : "Qualification";

  const secondaryInfo = isTeacher
    ? staff.department || "General Department"
    : isPeon
      ? staff.shift || "Full Day"
      : staff.qualification || "Library Staff";

  const isInactive = staff.status === "inactive";

  const statusPill = (
    <>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isInactive ? "bg-red-500" : "animate-pulse bg-green-500"
        }`}
      />

      {staff.status || "active"}
    </>
  );

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:ring-gray-700 lg:h-auto lg:flex-row lg:items-stretch">
      {/* Mobile / tablet banner */}
      <div
        className={`relative h-16 bg-gradient-to-r sm:h-20 lg:hidden ${theme.banner}`}
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />

        <div className="absolute -bottom-8 left-10 h-20 w-20 rounded-full bg-white/10" />

        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold capitalize shadow-sm backdrop-blur dark:bg-gray-900/80 sm:text-xs ${
            isInactive
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {statusPill}
        </span>
      </div>

      {/* Desktop accent bar */}
      <div
        className={`hidden w-1.5 shrink-0 bg-gradient-to-b lg:block ${theme.bar}`}
      />

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5 lg:flex-row lg:items-center lg:gap-6 lg:p-5">
        {/* Identity */}
        <div className="flex min-w-0 flex-col lg:w-72 lg:shrink-0 lg:flex-row lg:items-center lg:gap-4">
          {/* Profile Image */}
          <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 text-lg font-bold text-gray-700 shadow-md dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100 sm:-mt-10 sm:h-20 sm:w-20 sm:text-xl lg:mt-0 lg:h-16 lg:w-16 lg:border-0 lg:shadow-none">
            {staff.profileImage?.url ? (
              <img
                src={staff.profileImage.url}
                alt={staff.profileImage.alt || `${fullName} profile image`}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="mt-3 min-w-0 lg:mt-0 lg:flex-1">
            <h3
              className="truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg"
              title={fullName}
            >
              {fullName}
            </h3>

            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={`inline-block max-w-full truncate rounded-md px-2 py-0.5 text-[11px] font-medium sm:text-xs ${theme.chip}`}
                title={role}
              >
                {role}
              </span>

              <span
                className={`hidden items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize lg:inline-flex ${
                  isInactive
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                }`}
              >
                {statusPill}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:mt-5 sm:pt-5 lg:mt-0 lg:flex lg:min-w-0 lg:flex-1 lg:flex-wrap lg:gap-x-8 lg:gap-y-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <InfoRow
            icon={<BriefcaseBusiness size={15} />}
            label="Employee ID"
            value={staff.employeeId || "—"}
            iconClass={theme.icon}
          />

          <InfoRow
            icon={<Phone size={15} />}
            label="Phone"
            value={staff.phone || "—"}
            iconClass={theme.icon}
          />

          {staff.email && (
            <InfoRow
              icon={<Mail size={15} />}
              label="Email"
              value={staff.email}
              iconClass={theme.icon}
            />
          )}

          <InfoRow
            icon={<UserRound size={15} />}
            label={secondaryLabel}
            value={secondaryInfo}
            iconClass={theme.icon}
          />

          {staff.address && (
            <InfoRow
              icon={<MapPin size={15} />}
              label="Address"
              value={staff.address}
              iconClass={theme.icon}
              multiline
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-900/60 sm:p-4 lg:flex lg:w-40 lg:shrink-0 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:bg-transparent lg:p-5 dark:lg:bg-transparent">
        <button
          type="button"
          onClick={() => onEdit?.(staff)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.97] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(staff)}
          disabled={deleting}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <Trash2 size={14} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
};

const InfoRow = ({ icon, label, value, iconClass, multiline = false }) => {
  return (
    <div className="flex min-w-0 items-start gap-3 lg:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1.34rem)]">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:text-[11px]">
          {label}
        </p>

        <p
          className={`text-xs font-medium text-gray-800 dark:text-gray-200 sm:text-sm ${
            multiline ? "line-clamp-2 break-words" : "truncate"
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default StaffCard;
