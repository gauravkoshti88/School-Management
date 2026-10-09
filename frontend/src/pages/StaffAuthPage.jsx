import { useState } from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  School,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useWebsite } from "../context/WebsiteContext";
import { useStaff } from "../context/StaffContext";

const StaffLogin = () => {
  const navigate = useNavigate();

  const { website } = useWebsite();
  const { loginStaff } = useStaff();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const websiteName = website?.websiteName || "School Management System";

  const logo = website?.lightLogo?.url || website?.darkLogo?.url || "";

  const logoAlt =
    website?.lightLogo?.alt || website?.darkLogo?.alt || websiteName;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await loginStaff({
        email: formData.email.trim().toLowerCase(),

        password: formData.password,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Staff login failed.");
      }

      toast.success(response.message || "Login successful.");

      navigate("/staff/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Staff login error:", error);

      const responseData = error?.response?.data;

      toast.error(
        responseData?.message ||
          error?.message ||
          "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-indigo-600 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white text-indigo-600 shadow-lg">
                {logo ? (
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <School size={25} />
                )}
              </div>

              <div>
                <h1 className="max-w-xs truncate text-xl font-bold text-white">
                  {websiteName}
                </h1>

                <p className="text-sm text-indigo-100">Staff Portal</p>
              </div>
            </div>

            <div className="max-w-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                <ShieldCheck size={34} />
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Welcome to your
                <span className="block text-indigo-100">Staff Portal</span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">
                Sign in to manage your classes, students, attendance and other
                school responsibilities.
              </p>
            </div>

            <p className="text-sm text-indigo-100">
              Secure access for authorized school staff.
            </p>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-indigo-600 lg:hidden">
                {logo ? (
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <School size={27} />
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Staff Login
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to {websiteName} using your staff email and password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        errors.email ? "text-red-400" : "text-slate-400"
                      }`}
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="staff@example.com"
                      autoComplete="email"
                      disabled={loading}
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <KeyRound
                      size={18}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        errors.password ? "text-red-400" : "text-slate-400"
                      }`}
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole size={18} />

                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              {websiteName} · Staff access is restricted to authorized school
              employees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
