import { axiosInstance } from "./axios";

export const getStaffStudents = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/students");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffStudentById = async (studentId) => {
  try {
    const response = await axiosInstance.get(
      `/api/staff/students/${studentId}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStaffStudent = async (data) => {
  try {
    const response = await axiosInstance.post("/api/staff/students", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStaffStudent = async (studentId, data) => {
  try {
    const response = await axiosInstance.put(
      `/api/staff/students/${studentId}`,
      data,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadStaffStudentProfileImage = async (
  studentId,
  file,
  alt = "",
) => {
  try {
    if (!studentId) {
      throw new Error("Student ID is required.");
    }

    if (!(file instanceof File)) {
      throw new Error("Valid image file is required.");
    }

    const formData = new FormData();

    formData.append("image", file);

    if (alt) {
      formData.append("alt", alt);
    }

    const response = await axiosInstance.post(
      `/api/staff/students/${studentId}/profile-image`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStaffStudent = async (studentId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/staff/students/${studentId}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllStudents = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/students");

    return response.data;
  } catch (error) {
    throw error;
  }
};
