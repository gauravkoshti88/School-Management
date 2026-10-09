import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAdmin } from "../../context/AdminContext";

const AdminProfile = () => {
  const {
    admin,
    loading,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
  } = useAdmin();

  const fileInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!admin) {
      return;
    }

    setForm({
      fullname: admin.fullname || "",
      username: admin.username || "",
      password: "",
    });
  }, [admin]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const adminName = admin?.fullname || "Administrator";

  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const profileImage = previewUrl || admin?.profileImage?.url || "";

  const profileImageAlt =
    admin?.profileImage?.alt || `${adminName} profile image`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setForm({
      fullname: admin?.fullname || "",
      username: admin?.username || "",
      password: "",
    });

    setEditMode(true);
  };

  const handleCancel = () => {
    setForm({
      fullname: admin?.fullname || "",
      username: admin?.username || "",
      password: "",
    });

    setShowPassword(false);
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullname = form.fullname.trim();
    const username = form.username.trim();
    const password = form.password;

    if (!fullname) {
      toast.error("Full name is required.");
      return;
    }

    if (!username) {
      toast.error("Username is required.");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullname,
        username,
      };

      if (password) {
        payload.password = password;
      }

      const response = await updateProfile(payload);

      if (response?.success === false) {
        toast.error(response?.message || "Unable to update profile.");
        return;
      }

      toast.success("Admin profile updated successfully.");

      setForm((currentForm) => ({
        ...currentForm,
        fullname: response?.admin?.fullname || fullname,
        username: response?.admin?.username || username,
        password: "",
      }));

      setEditMode(false);
      setShowPassword(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be smaller than 5 MB.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(objectUrl);

    try {
      setImageLoading(true);

      const response = await uploadProfileImage(file);

      if (response?.success === false) {
        throw new Error(response?.message || "Unable to upload profile image.");
      }

      setSelectedImage(null);

      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");

      toast.success("Profile image updated successfully.");
    } catch (error) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      setSelectedImage(null);
      setPreviewUrl("");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to upload profile image.";

      toast.error(message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!admin?.profileImage?.url) {
      return;
    }

    try {
      setImageLoading(true);

      const response = await deleteProfileImage();

      if (response?.success === false) {
        throw new Error(response?.message || "Unable to delete profile image.");
      }

      toast.success("Profile image removed successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to delete profile image.";

      toast.error(message);
    } finally {
      setImageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="font-semibold text-slate-800">
            Admin profile not found.
          </p>

          <p className="mt-1 text-sm text-slate-500">Please login again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Account</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Admin Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your admin account and profile information.
          </p>
        </div>

        {!editMode ? (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-600 shadow-lg ring-1 ring-slate-200">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileImageAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                title="Change profile image"
              >
                <Camera size={17} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {imageLoading && (
              <p className="mt-4 text-xs font-medium text-indigo-600">
                Updating image...
              </p>
            )}

            {!imageLoading && admin?.profileImage?.url && (
              <button
                type="button"
                onClick={handleDeleteImage}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-600 transition hover:text-red-700"
              >
                <Trash2 size={14} />
                Remove Photo
              </button>
            )}

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {adminName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">School Administrator</p>

            <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Account Status</p>

                  <p className="text-sm font-semibold text-emerald-600">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              JPG, PNG or WebP · Maximum 5 MB
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Personal Information</h2>

              <p className="text-sm text-slate-500">
                Your administrator account details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullname"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="fullname"
                name="fullname"
                type="text"
                value={form.fullname}
                onChange={handleChange}
                disabled={!editMode || saving}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-default disabled:text-slate-600"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Username
              </label>

              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-default disabled:text-slate-600"
                />

                <UserRound
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <div className="relative">
                <input
                  id="email"
                  type="text"
                  value={admin?.email || "Email not available"}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-500 outline-none"
                />

                <Mail
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Email is managed by the system.
              </p>
            </div>

            {editMode && (
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <KeyRound size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Change Password
                    </h3>

                    <p className="text-xs text-slate-500">
                      Leave blank to keep your current password.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      disabled={saving}
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={saving}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 6 characters.
                  </p>
                </div>
              </div>
            )}

            {editMode && (
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4">
        <div className="flex gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-indigo-600" />

          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Profile Security
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-700">
              Password change karne ke liye current session automatically
              maintain rahega. Profile image securely Cloudinary par store hoti
              hai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
