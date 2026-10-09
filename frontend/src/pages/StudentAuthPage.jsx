import {
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useWebsite } from "../context/WebsiteContext";
import { studentLogin } from "../service/studentAuth.service";

const StudentAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { website, loading: websiteLoading } = useWebsite();

  const [form, setForm] = useState({
    admissionNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const websiteName = website?.websiteName || "School Management System";

  const logo = website?.lightLogo?.url || website?.darkLogo?.url || "";

  const logoAlt =
    website?.lightLogo?.alt || website?.darkLogo?.alt || websiteName;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "admissionNumber" ? value.toUpperCase() : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const admissionNumber = form.admissionNumber.trim();

    const password = form.password;

    if (!admissionNumber || !password) {
      setError("Admission number and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await studentLogin({
        admissionNumber,
        password,
      });

      const redirectPath =
        location.state?.from?.pathname || "/student/dashboard";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error("Student login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your admission number and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full">
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white shadow-sm">
                {websiteLoading ? (
                  <GraduationCap size={24} />
                ) : logo ? (
                  <img
                    src={logo}
                    alt={logoAlt}
                    className="h-full w-full bg-white object-contain p-1"
                  />
                ) : (
                  <GraduationCap size={24} />
                )}
              </div>

              <div className="min-w-0 text-left">
                <p className="max-w-[240px] truncate text-lg font-bold leading-none text-slate-900">
                  {websiteName}
                </p>

                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  School Management
                </p>
              </div>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UserRound size={26} />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Student Login
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Login to access your student portal
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admissionNumber"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Admission Number
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="admissionNumber"
                    name="admissionNumber"
                    type="text"
                    value={form.admissionNumber}
                    onChange={handleChange}
                    placeholder="ADM20260001"
                    autoComplete="username"
                    autoCapitalize="characters"
                    spellCheck="false"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Student Login"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-500">
                Are you an administrator or staff member?
              </p>

              <Link
                to="/"
                className="mt-2 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Back to School Portal
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Use the admission number and password provided by your school.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAuthPage;
