import { axiosInstance } from "./axios";

export const createTeacher = async (data) => {
  try {
    const response = await axiosInstance.post("/api/staff/teacher", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPeonStaff = async (data) => {
  try {
    const response = await axiosInstance.post("/api/staff/peon", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLibraryStaff = async (data) => {
  try {
    const response = await axiosInstance.post("/api/staff/library", data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeachers = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/teachers");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPeonStaff = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/peons");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLibraryStaff = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/libraries");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeacherById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/staff/teacher/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPeonStaffById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/staff/peon/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLibraryStaffById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/staff/library/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeacher = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/staff/teacher/${id}`, data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePeonStaff = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/staff/peon/${id}`, data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLibraryStaff = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/staff/library/${id}`, data);

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload teacher profile image
export const uploadTeacherProfileImage = async (id, file, alt = "") => {
  if (!id) {
    throw new Error("Teacher ID is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("Valid image file is required.");
  }

  const formData = new FormData();

  formData.append("image", file);

  if (alt) {
    formData.append("alt", alt);
  }

  try {
    const response = await axiosInstance.post(
      `/api/staff/teacher/${id}/profile-image`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload peon profile image
export const uploadPeonStaffProfileImage = async (id, file, alt = "") => {
  if (!id) {
    throw new Error("Peon staff ID is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("Valid image file is required.");
  }

  const formData = new FormData();

  formData.append("image", file);

  if (alt) {
    formData.append("alt", alt);
  }

  try {
    const response = await axiosInstance.post(
      `/api/staff/peon/${id}/profile-image`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload library staff profile image
export const uploadLibraryStaffProfileImage = async (id, file, alt = "") => {
  if (!id) {
    throw new Error("Library staff ID is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("Valid image file is required.");
  }

  const formData = new FormData();

  formData.append("image", file);

  if (alt) {
    formData.append("alt", alt);
  }

  try {
    const response = await axiosInstance.post(
      `/api/staff/library/${id}/profile-image`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeacher = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/staff/teacher/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePeonStaff = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/staff/peon/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLibraryStaff = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/staff/library/${id}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/dashboard");

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStaffDashboard = async () => {
  try {
    const response = await axiosInstance.get("/api/staff/dashboard");

    return response.data;
  } catch (error) {
    throw error;
  }
};
