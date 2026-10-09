import { BookOpen, Check, Trash2 } from "lucide-react";

const SubjectRow = ({
  subject,
  index,
  error = {},
  submitting = false,
  onChange,
  onRemove,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
            <BookOpen size={16} />
          </div>

          <h4 className="text-sm font-semibold text-slate-800">
            Subject {index + 1}
          </h4>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={submitting}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Remove subject ${index + 1}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FormInput
          label="Subject Name"
          value={subject.name}
          onChange={(event) => onChange(index, "name", event.target.value)}
          placeholder="e.g. Mathematics"
          required
          error={error[`subjects.${index}.name`]}
        />

        <FormInput
          label="Subject Code"
          value={subject.code}
          onChange={(event) => onChange(index, "code", event.target.value)}
          placeholder="e.g. MATH"
          required
          error={error[`subjects.${index}.code`]}
        />

        <FormSelect
          label="Type"
          value={subject.type}
          onChange={(event) => onChange(index, "type", event.target.value)}
          options={["Theory", "Practical", "Both"]}
          error={error[`subjects.${index}.type`]}
        />

        <FormInput
          label="Max Marks"
          type="number"
          value={subject.maxMarks}
          onChange={(event) => onChange(index, "maxMarks", event.target.value)}
          min="1"
          required
          error={error[`subjects.${index}.maxMarks`]}
        />

        <FormInput
          label="Passing Marks"
          type="number"
          value={subject.passingMarks}
          onChange={(event) =>
            onChange(index, "passingMarks", event.target.value)
          }
          min="0"
          required
          error={error[`subjects.${index}.passingMarks`]}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subject Status
          </label>

          <button
            type="button"
            onClick={() => onChange(index, "isActive", !subject.isActive)}
            disabled={submitting}
            className={`flex min-h-[46px] w-full items-center justify-between rounded-xl border bg-white px-4 text-sm font-medium transition ${
              subject.isActive
                ? "border-green-200 text-green-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            <span>{subject.isActive ? "Active" : "Inactive"}</span>

            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                subject.isActive ? "bg-green-100" : "bg-slate-100"
              }`}
            >
              {subject.isActive && <Check size={14} />}
            </span>
          </button>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(subject.isCompulsory)}
          onChange={(event) =>
            onChange(index, "isCompulsory", event.target.checked)
          }
          disabled={submitting}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Compulsory Subject
      </label>
    </div>
  );
};

const FormInput = ({
  label,
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
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

const FormSelect = ({ label, value, onChange, options, error }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={onChange}
        className={`w-full cursor-pointer rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default SubjectRow;
