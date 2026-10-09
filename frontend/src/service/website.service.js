import { axiosInstance } from "./axios";

export const getPublicWebsite = async () => {
  const response = await axiosInstance.get("/api/website/public");

  return response.data;
};

// Get website settings
export const getWebsite = async () => {
  const response = await axiosInstance.get("/api/website");

  return response.data;
};

// Create website settings
export const createWebsite = async (data) => {
  const response = await axiosInstance.post("/api/website", data);

  return response.data;
};

// Update website settings
export const updateWebsite = async (data) => {
  const response = await axiosInstance.put("/api/website", data);

  return response.data;
};

// Upload website image
export const uploadWebsiteImage = async ({ file, type, alt = "" }) => {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("type", type);
  formData.append("alt", alt);

  const response = await axiosInstance.post(
    "/api/website/upload-image",
    formData,
  );

  return response.data;
};

// Delete website image
export const deleteWebsiteImage = async (publicId) => {
  const response = await axiosInstance.delete("/api/website/delete-image", {
    data: {
      publicId,
    },
  });

  return response.data;
};
