import { axiosInstance } from "./axios";

export const getPeonDashboard = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/peon/dashboard");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPeonAttendanceHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get(
      "/api/staff/peon/dashboard/history",
      {
        params,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};
