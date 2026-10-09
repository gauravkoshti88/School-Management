import { axiosInstance } from "./axios";

export const getTodayAttendance = async (date) => {
  const response = await axiosInstance.get("/api/staff/attendance", {
    params: {
      date,
    },
  });

  return response.data;
};

export const markAttendance = async (data) => {
  const response = await axiosInstance.post("/api/staff/attendance", data);

  return response.data;
};

export const updateAttendance = async (attendanceId, status) => {
  const response = await axiosInstance.put(
    `/api/staff/attendance/${attendanceId}`,
    {
      status,
    },
  );

  return response.data;
};

export const getAttendanceHistory = async (params) => {
  const response = await axiosInstance.get("/api/staff/attendance/history", {
    params,
  });

  return response.data;
};
