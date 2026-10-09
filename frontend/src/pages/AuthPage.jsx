import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAdmin } from "../context/AdminContext";
import { useWebsite } from "../context/WebsiteContext";

const AuthPage = () => {
  const navigate = useNavigate();

  const { loginAdmin } = useAdmin();
  const { website, loading: websiteLoading } = useWebsite();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const websiteName = website?.websiteName || "School Management System";

  const logo = website?.lightLogo?.url || website?.darkLogo?.url || "";

  const logoAlt =
    website?.lightLogo?.alt || website?.darkLogo?.alt || websiteName;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (!password) {
      toast.error("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginAdmin({
        username: username.trim(),
        password,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to login.");
      }

      toast.success("Admin login successful.");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid username or password.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 text-white">
            {logo ? (
              <img
                src={logo}
                alt={logoAlt}
                className="h-full w-full object-contain"
              />
            ) : (
              <GraduationCap size={32} />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>

          <p className="mt-2 text-sm text-slate-500">{websiteName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              disabled={loading || websiteLoading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading || websiteLoading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || websiteLoading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
