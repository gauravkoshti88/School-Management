import { ArrowLeft, GraduationCap, Plus } from "lucide-react";
import SubjectRow from "./SubjectRow";

const ClassForm = ({
  formData,
  fieldErrors,
  editing,
  submitting,
  teachers = [],
  teachersLoading = false,
  onChange,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
  onSubmit,
  onClose,
}) => {
  const teacherOptions = teachers.map((teacher) => {
    const fullName = `${teacher.firstName || ""} ${
      teacher.lastName || ""
    }`.trim();

    const assignedClassId =
      teacher.assignedClass?._id || teacher.assignedClass || null;

    const isCurrentClassTeacher =
      editing &&
      formData.classTeacher &&
      assignedClassId &&
      assignedClassId.toString() === formData.classTeacher.toString();

    const isAssignedToAnotherClass = assignedClassId && !isCurrentClassTeacher;

    let assignedClassText = "";

    if (teacher.assignedClass && typeof teacher.assignedClass === "object") {
      const className = teacher.assignedClass.name || "";
      const section = teacher.assignedClass.section || "";
      const academicYear = teacher.assignedClass.academicYear || "";

      assignedClassText = [className, section].filter(Boolean).join(" - ");

      if (academicYear) {
        assignedClassText += ` (${academicYear})`;
      }
    }

    return {
      value: teacher._id,
      label: `${fullName || "Unknown Teacher"}${
        teacher.employeeId ? ` (${teacher.employeeId})` : ""
      }${
        isAssignedToAnotherClass && assignedClassText
          ? ` — Assigned to ${assignedClassText}`
          : ""
      }`,
      disabled: Boolean(isAssignedToAnotherClass),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {editing ? "Edit Class" : "Create Class"}
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {editing
              ? "Update class, teacher and subject information."
              : "Add class details and assign subjects."}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 sm:h-12 sm:w-12">
              <GraduationCap size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Class Information
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Enter class and academic details.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <section>
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-900">
                Basic Information
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Add class, section and classroom details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInput
                label="Class Name"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="e.g. Class 5"
                required
                error={fieldErrors.name}
              />

              <FormInput
                label="Section"
                name="section"
                value={formData.section}
                onChange={onChange}
                placeholder="e.g. A"
                required
                error={fieldErrors.section}
              />

              <FormInput
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={onChange}
                placeholder="e.g. 2026-27"
                required
                error={fieldErrors.academicYear}
              />

              <FormSelect
                label="Class Teacher"
                name="classTeacher"
                value={formData.classTeacher}
                onChange={onChange}
                options={teacherOptions}
                placeholder={
                  teachersLoading
                    ? "Loading teachers..."
                    : teachers.length === 0
                      ? "No teachers available"
                      : "Select class teacher"
                }
                disabled={teachersLoading || teachers.length === 0}
                error={fieldErrors.classTeacher}
              />

              <FormInput
                label="Room Number"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={onChange}
                placeholder="e.g. 201"
                error={fieldErrors.roomNumber}
              />

              <FormInput
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={onChange}
                placeholder="e.g. 40"
                min="1"
                required
                error={fieldErrors.capacity}
              />

              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={onChange}
                options={[
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "inactive",
                    label: "Inactive",
                  },
                ]}
                error={fieldErrors.status}
              />
            </div>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-7 sm:mt-9 sm:pt-8">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-900">
                Subjects
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Add all subjects assigned to this class.
              </p>
            </div>

            {fieldErrors.subjects && (
              <p className="mb-4 text-xs font-medium text-red-500">
                {fieldErrors.subjects}
              </p>
            )}

            <div className="space-y-4">
              {formData.subjects.map((subject, index) => (
                <SubjectRow
                  key={subject._id || `new-${index}`}
                  subject={subject}
                  index={index}
                  error={fieldErrors}
                  submitting={submitting}
                  onChange={onSubjectChange}
                  onRemove={onRemoveSubject}
                />
              ))}
            </div>

            <div className="mt-5 flex justify-start">
              <button
                type="button"
                onClick={onAddSubject}
                disabled={submitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                Add Subject
              </button>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting
              ? editing
                ? "Updating..."
                : "Creating..."
              : editing
                ? "Update Class"
                : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  min,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full cursor-pointer rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
        }`}
      >
        <option value="">{placeholder || `Select ${label}`}</option>

        {options.map((option) => {
          if (typeof option === "object") {
            return (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            );
          }

          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default ClassForm;
