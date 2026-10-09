import configureCloudinary from "../config/cloudinary.js";

export const uploadBufferToCloudinary = (
  buffer,
  folder = "school-management",
) => {
  return new Promise((resolve, reject) => {
    try {
      const cloudinary = configureCloudinary();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          return resolve(result);
        },
      );

      uploadStream.end(buffer);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return null;
  }

  const cloudinary = configureCloudinary();

  return cloudinary.uploader.destroy(publicId);
};
