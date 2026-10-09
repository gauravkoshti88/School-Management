import { axiosInstance } from "./axios";

// Staff login
export const staffLogin = async (data) => {
  const response = await axiosInstance.post("/api/auth/staff/login", data);

  return response.data;
};

// Get logged-in staff
export const getStaff = async () => {
  const response = await axiosInstance.get("/api/auth/staff/me");

  return response.data;
};

// Staff logout
export const staffLogout = async () => {
  const response = await axiosInstance.post("/api/auth/staff/logout");

  return response.data;
};
