import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getStaff, staffLogin } from "../service/auth.service";

const defaultStaff = {
  _id: "",
  staffType: "",

  firstName: "",
  lastName: "",
  email: "",
  phone: "",

  gender: "",
  dateOfBirth: null,
  joiningDate: null,

  employeeId: "",
  address: "",
  status: "inactive",

  qualification: "",
  specialization: "",
  experience: "",
  department: "",

  assignedClass: null,

  shift: "",
  emergencyContact: "",

  libraryRole: "",

  profileImage: {
    publicId: "",
    url: "",
    alt: "",
  },
};

const normalizeStaff = (staff) => {
  if (!staff) {
    return {
      ...defaultStaff,
      profileImage: {
        ...defaultStaff.profileImage,
      },
    };
  }

  return {
    ...defaultStaff,
    ...staff,

    _id: staff._id || "",
    staffType: staff.staffType || "",

    firstName: staff.firstName || "",
    lastName: staff.lastName || "",
    email: staff.email || "",
    phone: staff.phone || "",

    gender: staff.gender || "",
    dateOfBirth: staff.dateOfBirth || null,
    joiningDate: staff.joiningDate || null,

    employeeId: staff.employeeId || "",
    address: staff.address || "",
    status: staff.status || "inactive",

    qualification: staff.qualification || "",
    specialization: staff.specialization || "",
    experience: staff.experience || "",
    department: staff.department || "",

    assignedClass: staff.assignedClass || null,

    shift: staff.shift || "",
    emergencyContact: staff.emergencyContact || "",

    libraryRole: staff.libraryRole || "",

    profileImage: {
      publicId: staff.profileImage?.publicId || "",
      url: staff.profileImage?.url || "",
      alt: staff.profileImage?.alt || "",
    },
  };
};

const StaffContext = createContext(null);

export const StaffProvider = ({ children }) => {
  const [staff, setStaff] = useState(defaultStaff);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getStaff();

      const staffData =
        response?.staff || response?.data?.staff || response?.data || null;

      if (staffData) {
        setStaff(normalizeStaff(staffData));
      } else {
        setStaff({
          ...defaultStaff,
          profileImage: {
            ...defaultStaff.profileImage,
          },
        });
      }

      return staffData;
    } catch (error) {
      if (error?.response?.status === 401) {
        setStaff({
          ...defaultStaff,
          profileImage: {
            ...defaultStaff.profileImage,
          },
        });

        setError(null);

        return null;
      }

      console.error("Fetch staff context error:", error);

      setError(error);

      setStaff({
        ...defaultStaff,
        profileImage: {
          ...defaultStaff.profileImage,
        },
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const loginStaff = useCallback(async (data) => {
    try {
      setError(null);

      const response = await staffLogin(data);

      const staffData =
        response?.staff || response?.data?.staff || response?.data || null;

      if (!staffData) {
        throw new Error("Staff data was not returned after login.");
      }

      setStaff(normalizeStaff(staffData));

      setLoading(false);

      return response;
    } catch (error) {
      setError(error);

      throw error;
    }
  }, []);

  const updateStaff = useCallback((data) => {
    setStaff((currentStaff) =>
      normalizeStaff({
        ...currentStaff,
        ...data,
      }),
    );
  }, []);

  const clearStaff = useCallback(() => {
    setStaff({
      ...defaultStaff,
      profileImage: {
        ...defaultStaff.profileImage,
      },
    });

    setError(null);
    setLoading(false);
  }, []);

  const fullName = `${staff.firstName || ""} ${staff.lastName || ""}`.trim();

  const initials = `${staff.firstName?.charAt(0) || ""}${
    staff.lastName?.charAt(0) || ""
  }`.toUpperCase();

  const value = {
    staff,

    loading,

    error,

    fetchStaff,
    refreshStaff: fetchStaff,

    loginStaff,

    updateStaff,

    clearStaff,

    isTeacher: staff.staffType === "teacher",

    isPeonStaff: staff.staffType === "peon",

    isLibraryStaff: staff.staffType === "library",

    fullName: fullName || "Staff",

    initials: initials || "S",

    profileImage: staff.profileImage?.url || "",
  };

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);

  if (!context) {
    throw new Error("useStaff must be used inside StaffProvider.");
  }

  return context;
};

export default StaffContext;
