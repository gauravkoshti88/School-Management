import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Library,
  Mail,
  Phone,
  Trash2,
  User,
  UserRoundPlus,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4";

const inputWithIconClass =
  "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4";

const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

const fieldIcons = {
  firstName: User,
  lastName: User,
  email: Mail,
  phone: Phone,
  dateOfBirth: CalendarDays,
  qualification: GraduationCap,
  specialization: Library,
  experience: BriefcaseBusiness,
  joiningDate: CalendarDays,
  employeeId: UserRoundPlus,
  department: Building2,
  emergencyContact: Phone,
  password: KeyRound,
};

const StaffForm = ({
  staff,
  formData,
  onChange,
  onSubmit,
  onClose,
  submitting = false,
  fieldErrors = {},
  editing = false,
  profileImage,
  onProfileImageChange,
  onRemoveProfileImage,
}) => {
  const fileInputRef = useRef(null);
  const previewObjectUrlRef = useRef(null);

  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const currentProfileImage = profileImage ?? formData?.profileImage ?? null;

  useEffect(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setImageError("");

    if (!currentProfileImage) {
      setImagePreview("");
      return;
    }

    if (typeof File !== "undefined" && currentProfileImage instanceof File) {
      const objectUrl = URL.createObjectURL(currentProfileImage);

      previewObjectUrlRef.current = objectUrl;
      setImagePreview(objectUrl);

      return;
    }

    if (typeof Blob !== "undefined" && currentProfileImage instanceof Blob) {
      const objectUrl = URL.createObjectURL(currentProfileImage);

      previewObjectUrlRef.current = objectUrl;
      setImagePreview(objectUrl);

      return;
    }

    if (typeof currentProfileImage === "string") {
      setImagePreview(currentProfileImage);
      return;
    }

    if (typeof currentProfileImage === "object" && currentProfileImage.url) {
      setImagePreview(currentProfileImage.url);
      return;
    }

    setImagePreview("");
  }, [currentProfileImage]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setShowPassword(false);
  }, [editing, staff?.title]);

  if (!staff) {
    return null;
  }

  const fields = staff.fields || [];

  const title = editing
    ? staff.editTitle || `Edit ${staff.title}`
    : staff.title;

  const description = editing
    ? `Update ${staff.title.toLowerCase()} information.`
    : staff.description;

  const submitText = submitting
    ? editing
      ? "Updating..."
      : "Creating..."
    : editing
      ? "Update Staff"
      : "Create Staff";

  const getInputClass = (fieldName, hasIcon = false, hasRightIcon = false) => {
    const hasError = Boolean(fieldErrors[fieldName]);

    let baseClass = hasIcon ? inputWithIconClass : inputClass;

    if (hasRightIcon) {
      baseClass = `${baseClass} pr-12`;
    }

    const borderClass = hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10";

    return `${baseClass} ${borderClass}`;
  };

  const renderFieldError = (fieldName) => {
    if (!fieldErrors[fieldName]) {
      return null;
    }

    return (
      <p className="mt-1.5 text-xs font-medium text-red-500">
        {fieldErrors[fieldName]}
      </p>
    );
  };

  const renderLabel = (field) => {
    const isPassword = field.name === "password";
    const isRequired = isPassword ? !editing : field.required;

    return (
      <label
        htmlFor={field.name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {field.label}

        {isRequired && <span className="ml-1 text-red-500">*</span>}
      </label>
    );
  };

  const handleProfileImageClick = () => {
    if (submitting) {
      return;
    }

    setImageError("");
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Please select a JPG, PNG or WebP image.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setImageError("Profile image must be smaller than 5 MB.");
      return;
    }

    setImageError("");
    onProfileImageChange?.(file);
  };

  const handleRemoveProfileImage = () => {
    if (submitting) {
      return;
    }

    setImageError("");

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setImagePreview("");
    onRemoveProfileImage?.();
  };

  const personalFields = fields.filter((field) => field.section === "personal");

  const employmentFields = fields.filter(
    (field) => field.section === "employment",
  );

  const currentInitials =
    `${formData.firstName?.charAt(0) || ""}${
      formData.lastName?.charAt(0) || ""
    }`.toUpperCase() || "U";

  const renderField = (field) => {
    const Icon = fieldIcons[field.name];
    const hasError = Boolean(fieldErrors[field.name]);

    const isPassword = field.name === "password";

    const isRequired = isPassword ? !editing : field.required;

    if (field.type === "textarea") {
      return (
        <div
          key={field.name}
          className={field.fullWidth ? "md:col-span-2" : ""}
        >
          {renderLabel(field)}

          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={onChange}
            placeholder={field.placeholder}
            required={isRequired}
            rows={4}
            className={`${getInputClass(field.name)} resize-none`}
          />

          {renderFieldError(field.name)}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.name}>
          {renderLabel(field)}

          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={onChange}
            required={isRequired}
            className={`${getInputClass(field.name)} cursor-pointer`}
          >
            <option value="">Select {field.label}</option>

            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {renderFieldError(field.name)}
        </div>
      );
    }

    if (isPassword) {
      return (
        <div key={field.name}>
          {renderLabel(field)}

          <div className="relative">
            <KeyRound
              size={18}
              className={`${iconClass} ${hasError ? "text-red-400" : ""}`}
            />

            <input
              id={field.name}
              name={field.name}
              type={showPassword ? "text" : "password"}
              value={formData[field.name] || ""}
              onChange={onChange}
              placeholder={editing ? "Enter new password" : "Enter password"}
              required={isRequired}
              minLength={field.minLength || 6}
              maxLength={field.maxLength}
              autoComplete={editing ? "new-password" : "new-password"}
              className={getInputClass(field.name, true, true)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            {editing
              ? "Leave blank to keep the existing password."
              : "Password must be at least 6 characters."}
          </p>

          {renderFieldError(field.name)}
        </div>
      );
    }

    return (
      <div key={field.name}>
        {renderLabel(field)}

        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className={`${iconClass} ${hasError ? "text-red-400" : ""}`}
            />
          )}

          <input
            id={field.name}
            name={field.name}
            type={field.type || "text"}
            value={formData[field.name] || ""}
            onChange={onChange}
            placeholder={field.placeholder}
            required={isRequired}
            minLength={field.minLength}
            maxLength={field.maxLength}
            autoComplete="off"
            className={getInputClass(field.name, Boolean(Icon))}
          />
        </div>

        {renderFieldError(field.name)}
      </div>
    );
  };

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
            {title}
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${staff.iconBg}`}
            >
              {staff.icon && (
                <staff.icon size={23} className={staff.iconColor} />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                {title}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {editing
                  ? "Update the staff information below."
                  : "Enter accurate staff information."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <section className="mb-8">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-900">
                Profile Image
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Upload a professional profile image for this staff member.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 text-2xl font-bold text-slate-500 shadow-sm">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={
                        formData.firstName || formData.lastName
                          ? `${formData.firstName || ""} ${
                              formData.lastName || ""
                            } profile`
                          : "Staff profile"
                      }
                      className="h-full w-full object-cover"
                      onError={() => {
                        setImagePreview("");
                        setImageError("Unable to load the profile image.");
                      }}
                    />
                  ) : (
                    currentInitials
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleProfileImageClick}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Camera size={16} />

                    {imagePreview ? "Change Image" : "Upload Image"}
                  </button>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG or WebP. Maximum 5 MB.
                </p>

                {imageError && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {imageError}
                  </p>
                )}
              </div>
            </div>
          </section>

          {personalFields.length > 0 && (
            <section>
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Personal Information
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Enter personal and contact information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {personalFields.map(renderField)}
              </div>
            </section>
          )}

          {employmentFields.length > 0 && (
            <section className="mt-8 border-t border-slate-200 pt-7 sm:mt-9 sm:pt-8">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-900">
                  {staff.employmentTitle || "Employment Details"}
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Add employment and job-related information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {employmentFields.map(renderField)}
              </div>
            </section>
          )}
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
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
