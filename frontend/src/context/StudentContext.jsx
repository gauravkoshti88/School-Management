import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getStudent, studentLogout } from "../service/studentAuth.service";

const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudent();

      const studentData =
        response?.student || response?.data?.student || response?.data || null;

      setStudent(studentData);

      return studentData;
    } catch (error) {
      if (error?.response?.status === 401) {
        setStudent(null);
        setError("");
        return null;
      }

      console.error("Get student error:", error);

      setStudent(null);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load student.";

      setError(message);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStudent = useCallback(async () => {
    return fetchStudent();
  }, [fetchStudent]);

  const logoutStudent = useCallback(async () => {
    try {
      await studentLogout();
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error("Student logout error:", error);
      }
    } finally {
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const fullName = useMemo(() => {
    return (
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      "Student"
    );
  }, [student]);

  const initials = useMemo(() => {
    if (!student) {
      return "S";
    }

    const firstName = student.firstName?.trim()?.charAt(0) || "";

    const lastName = student.lastName?.trim()?.charAt(0) || "";

    return `${firstName}${lastName}`.toUpperCase() || "S";
  }, [student]);

  const profileImage = useMemo(() => {
    return student?.profileImage?.url || "";
  }, [student]);

  const value = useMemo(
    () => ({
      student,
      setStudent,
      loading,
      error,
      fetchStudent,
      refreshStudent,
      logoutStudent,
      fullName,
      initials,
      profileImage,
    }),
    [
      student,
      loading,
      error,
      fetchStudent,
      refreshStudent,
      logoutStudent,
      fullName,
      initials,
      profileImage,
    ],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudent must be used inside StudentProvider");
  }

  return context;
};

export default StudentContext;
