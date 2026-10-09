import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import PageLoader from "./PageLoader";
import { getStudent } from "../service/studentAuth.service";

const StudentProtectedRoute = () => {
  const [status, setStatus] = useState("loading");

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        await getStudent();

        if (mounted) {
          setStatus("authenticated");
        }
      } catch (error) {
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
    return <PageLoader />;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/student/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
};

export default StudentProtectedRoute;
