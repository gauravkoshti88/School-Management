import { axiosInstance } from "./axios";

export const studentLogin = async (data) => {
  const response = await axiosInstance.post("/api/auth/student/login", data);

  return response.data;
};

export const getStudent = async () => {
  const response = await axiosInstance.get("/api/auth/student/me");

  return response.data;
};

export const studentLogout = async () => {
  const response = await axiosInstance.post("/api/auth/student/logout");

  return response.data;
};

export const getStudentDashboard = async () => {
  const response = await axiosInstance.get("/api/student/dashboard");

  return response.data;
};
