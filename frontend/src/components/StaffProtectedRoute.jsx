import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import PageLoader from "./PageLoader";
import { getStaff } from "../service/auth.service";

const StaffProtectedRoute = () => {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkStaffAuthentication = async () => {
      try {
        await getStaff();

        if (mounted) {
          setStatus("authenticated");
        }
      } catch (error) {
        if (mounted) {
          setStatus("unauthenticated");
        }
      }
    };

    checkStaffAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/staff/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default StaffProtectedRoute;
