import { axiosInstance } from "./axios";

// Get active staff by selected staff type
export const getStaffForAttendance = async (staffType) => {
  if (!staffType) {
    throw new Error("Staff type is required.");
  }

  const response = await axiosInstance.get(
    "/api/admin/staff-attendance/staff",
    {
      params: {
        staffType,
      },
    },
  );

  return response.data;
};

// Get attendance for selected staff type and date
export const getStaffAttendance = async ({ staffType, date }) => {
  if (!staffType) {
    throw new Error("Staff type is required.");
  }

  if (!date) {
    throw new Error("Attendance date is required.");
  }

  const response = await axiosInstance.get("/api/admin/staff-attendance", {
    params: {
      staffType,
      date,
    },
  });

  return response.data;
};

// Save or update staff attendance
export const saveStaffAttendance = async ({ staffType, date, attendance }) => {
  if (!staffType) {
    throw new Error("Staff type is required.");
  }

  if (!date) {
    throw new Error("Attendance date is required.");
  }

  if (!Array.isArray(attendance)) {
    throw new Error("Attendance must be an array.");
  }

  const response = await axiosInstance.post(
    "/api/admin/staff-attendance/bulk",
    {
      staffType,
      date,
      attendance,
    },
  );

  return response.data;
};

// Get staff attendance history
export const getStaffAttendanceHistory = async ({
  staffType,
  staffId = "",
  startDate = "",
  endDate = "",
}) => {
  if (!staffType) {
    throw new Error("Staff type is required.");
  }

  const params = {
    staffType,
  };

  if (staffId) {
    params.staffId = staffId;
  }

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  const response = await axiosInstance.get(
    "/api/admin/staff-attendance/history",
    {
      params,
    },
  );

  return response.data;
};

// Delete staff attendance record
export const deleteStaffAttendance = async (attendanceId) => {
  if (!attendanceId) {
    throw new Error("Attendance ID is required.");
  }

  const response = await axiosInstance.delete(
    `/api/admin/staff-attendance/${attendanceId}`,
  );

  return response.data;
};
