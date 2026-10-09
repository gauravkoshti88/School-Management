import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Trash2,
  UserRound,
} from "lucide-react";

const ClassCard = ({
  schoolClass,
  teacherName,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  const activeSubjects =
    schoolClass.subjects?.filter((subject) => subject.isActive !== false) || [];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 p-5 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <GraduationCap size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-gray-900 dark:text-white">
                {schoolClass.name}
              </h2>

              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Section {schoolClass.section}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
              schoolClass.status === "inactive"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {schoolClass.status || "active"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox
            icon={<Building2 size={15} />}
            label="Academic Year"
            value={schoolClass.academicYear || "—"}
          />

          <InfoBox
            icon={<UserRound size={15} />}
            label="Class Teacher"
            value={teacherName}
          />

          <InfoBox
            icon={<BriefcaseBusiness size={15} />}
            label="Room"
            value={schoolClass.roomNumber || "—"}
          />

          <InfoBox
            icon={<UserRound size={15} />}
            label="Capacity"
            value={schoolClass.capacity || "—"}
          />
        </div>

        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Subjects
            </p>

            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {activeSubjects.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeSubjects.length > 0 ? (
              activeSubjects.map((subject) => (
                <span
                  key={subject._id || `${subject.code}-${subject.name}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <BookOpen size={12} />
                  {subject.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No active subjects</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
        <button
          type="button"
          onClick={() => onEdit?.(schoolClass)}
          className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(schoolClass)}
          disabled={deleting}
          className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          <Trash2 size={15} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
};

const InfoBox = ({ icon, label, value }) => {
  return (
    <div className="min-w-0 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}

        <span className="truncate text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-200">
        {value}
      </p>
    </div>
  );
};

export default ClassCard;
