import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useWebsite } from "../context/WebsiteContext";
import { useStaff } from "../context/StaffContext";

const DocumentTitle = () => {
  const location = useLocation();

  const { website } = useWebsite();
  const { staff } = useStaff();

  useEffect(() => {
    const websiteName = website?.websiteName || "School Management System";

    const path = location.pathname.toLowerCase();

    let role = "";

    if (path.startsWith("/admin")) {
      role = "Admin";
    } else if (path.startsWith("/staff")) {
      if (staff?.staffType === "teacher") {
        role = "Teacher";
      } else if (staff?.staffType === "peon") {
        role = "Peon";
      } else if (staff?.staffType === "library") {
        role = "Librarian";
      } else {
        role = "Staff";
      }
    } else if (path.startsWith("/student")) {
      role = "Student";
    }

    document.title = role ? `${websiteName} - ${role}` : websiteName;
  }, [location.pathname, website?.websiteName, staff?.staffType]);

  return null;
};

export default DocumentTitle;
