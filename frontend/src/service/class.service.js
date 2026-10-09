import { axiosInstance } from "./axios";

// Create class
export const createClass = async (data) => {
  try {
    const response = await axiosInstance.post("/api/classes", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all classes
export const getClasses = async () => {
  try {
    const response = await axiosInstance.get("/api/classes");

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get class by ID
export const getClassById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/classes/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update class
export const updateClass = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/classes/${id}`, data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete class
export const deleteClass = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/classes/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
