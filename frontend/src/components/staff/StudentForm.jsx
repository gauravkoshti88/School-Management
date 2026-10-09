import { ImagePlus, X } from "lucide-react";

const StudentForm = ({
  form,
  editingStudent,
  saving,
  profileImage,
  onProfileImageChange,
  onRemoveProfileImage,
  onChange,
  onSubmit,
  onClose,
}) => {
  const imagePreview = (() => {
    if (!profileImage) {
      return "";
    }

    if (profileImage instanceof File) {
      return URL.createObjectURL(profileImage);
    }

    if (typeof profileImage === "string") {
      return profileImage;
    }

    if (profileImage?.url) {
      return profileImage.url;
    }

    return "";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingStudent ? "Edit Student" : "Add Student"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Student will automatically be added to your assigned class.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={
                      typeof profileImage === "object" && profileImage?.alt
                        ? profileImage.alt
                        : "Student profile"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus size={30} className="text-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Student Profile Image
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WebP. Maximum file size 5 MB.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    <ImagePlus size={16} />

                    {imagePreview ? "Change Image" : "Choose Image"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={onProfileImageChange}
                      disabled={saving}
                    />
                  </label>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={onRemoveProfileImage}
                      disabled={saving}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First Name
              </label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="Enter first name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last Name
              </label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Enter last name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Father's Name
              </label>

              <input
                name="fatherName"
                value={form.fatherName}
                onChange={onChange}
                placeholder="Enter father's name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mother's Name
              </label>

              <input
                name="motherName"
                value={form.motherName}
                onChange={onChange}
                placeholder="Enter mother's name"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Enter phone number"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Student Password
                {!editingStudent && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>

              <input
                type="password"
                name="password"
                value={form.password || ""}
                onChange={onChange}
                placeholder={
                  editingStudent
                    ? "Enter new password"
                    : "Enter student password"
                }
                minLength={6}
                required={!editingStudent}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                {editingStudent
                  ? "Leave blank to keep the existing password."
                  : "Password must be at least 6 characters."}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Enter student address"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingStudent
                  ? "Update Student"
                  : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
