import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { axiosInstance } from "../service/axios";
import PageLoader from "./PageLoader";
import { getStaff } from "../service/auth.service";

const ProtectedRoute = () => {
  const [status, setStatus] = useState("loading");

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        let res = await axiosInstance.get("/api/admin/get-admin");

        if (mounted) {
          setStatus("authenticated");
        }
      } catch {
        if (mounted) {
          setStatus("unauthenticated");
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
