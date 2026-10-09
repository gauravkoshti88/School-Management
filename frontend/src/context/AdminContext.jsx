import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAdmin,
  adminLogin,
  adminLogout,
  updateAdminProfile,
  uploadAdminProfileImage,
  deleteAdminProfileImage,
} from "../service/admin.service";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdmin();

      const adminData =
        response?.admin || response?.data?.admin || response?.data || null;

      setAdmin(adminData);

      return adminData;
    } catch (error) {
      if (error?.response?.status === 401) {
        setAdmin(null);
        return null;
      }

      setAdmin(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const refreshAdmin = useCallback(() => {
    return fetchAdmin();
  }, [fetchAdmin]);

  const loginAdmin = useCallback(async (data) => {
    const response = await adminLogin(data);

    const adminData =
      response?.admin || response?.data?.admin || response?.data || null;

    if (adminData) {
      setAdmin(adminData);
    }

    setLoading(false);

    return response;
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      const response = await adminLogout();

      return response;
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error("Admin logout error:", error);
      }

      return null;
    } finally {
      setAdmin(null);
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await updateAdminProfile(data);

    const updatedAdmin =
      response?.admin || response?.data?.admin || response?.data || null;

    if (updatedAdmin) {
      setAdmin(updatedAdmin);
    }

    return response;
  }, []);

  const uploadProfileImage = useCallback(async (file, alt = "") => {
    const response = await uploadAdminProfileImage(file, alt);

    const updatedAdmin =
      response?.admin || response?.data?.admin || response?.data || null;

    if (updatedAdmin) {
      setAdmin(updatedAdmin);
    } else if (response?.profileImage) {
      setAdmin((currentAdmin) => ({
        ...currentAdmin,
        profileImage: response.profileImage,
      }));
    }

    return response;
  }, []);

  const deleteProfileImage = useCallback(async () => {
    const response = await deleteAdminProfileImage();

    const updatedAdmin =
      response?.admin || response?.data?.admin || response?.data || null;

    if (updatedAdmin) {
      setAdmin(updatedAdmin);
    } else {
      setAdmin((currentAdmin) => ({
        ...currentAdmin,
        profileImage: {
          publicId: "",
          url: "",
          alt: "",
        },
      }));
    }

    return response;
  }, []);

  const clearAdmin = useCallback(() => {
    setAdmin(null);
    setLoading(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
        loading,
        refreshAdmin,
        fetchAdmin,
        loginAdmin,
        logoutAdmin,
        updateProfile,
        uploadProfileImage,
        deleteProfileImage,
        clearAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }

  return context;
};

export default AdminContext;
