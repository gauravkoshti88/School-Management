import { axiosInstance } from "./axios";

// Admin login
export const adminLogin = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Login data is required.");
  }

  const response = await axiosInstance.post("/api/admin/login", data);

  return response.data;
};

// Admin logout
export const adminLogout = async () => {
  const response = await axiosInstance.post("/api/admin/logout");

  return response.data;
};

// Get logged-in admin
export const getAdmin = async () => {
  const response = await axiosInstance.get("/api/admin/get-admin");

  return response.data;
};

// Update admin profile
export const updateAdminProfile = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Admin profile data is required.");
  }

  const response = await axiosInstance.put("/api/admin/profile", data);

  return response.data;
};

// Upload admin profile image
export const uploadAdminProfileImage = async (file, alt = "") => {
  if (!(file instanceof File)) {
    throw new Error("Valid image file is required.");
  }

  const formData = new FormData();

  formData.append("image", file);

  if (alt) {
    formData.append("alt", alt);
  }

  const response = await axiosInstance.post(
    "/api/admin/profile/image",
    formData,
  );

  return response.data;
};

// Delete admin profile image
export const deleteAdminProfileImage = async () => {
  const response = await axiosInstance.delete("/api/admin/profile/image");

  return response.data;
};
