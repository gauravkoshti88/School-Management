import Website from "../models/website.model.js";
import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../utils/cloudinary.utils.js";

const getWebsite = async (req, res) => {
  try {
    let website = await Website.findOne().lean();

    if (!website) {
      website = await Website.create({
        websiteName: "School Management System",
      });

      website = website.toObject();
    }

    return res.status(200).json({
      success: true,
      message: "Website settings fetched successfully.",
      website,
    });
  } catch (error) {
    console.error("Get website error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch website settings.",
    });
  }
};

const uploadWebsiteImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required.",
      });
    }

    const imageType = req.body.type;

    const folderMap = {
      favicon: "school-management/website/favicon",
      lightLogo: "school-management/website/light-logo",
      darkLogo: "school-management/website/dark-logo",
      mainPoster: "school-management/website/main-poster",
      about: "school-management/website/about",
    };

    const folder = folderMap[imageType];

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type.",
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        publicId: result.public_id,
        url: result.secure_url,
        alt: req.body.alt || "",
      },
    });
  } catch (error) {
    console.error("Upload website image error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload image.",
    });
  }
};

const deleteWebsiteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Image public ID is required.",
      });
    }

    await deleteFromCloudinary(publicId);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error("Delete website image error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete image.",
    });
  }
};

const createWebsite = async (req, res) => {
  try {
    const existingWebsite = await Website.findOne();

    if (existingWebsite) {
      return res.status(409).json({
        success: false,
        message: "Website settings already exist. Please update them.",
      });
    }

    const {
      websiteName,
      favicon,
      lightLogo,
      darkLogo,
      mainPoster,
      about,
      contact,
      socialLinks,
    } = req.body;

    if (!websiteName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Website name is required.",
      });
    }

    const website = await Website.create({
      websiteName: websiteName.trim(),
      favicon: favicon || {},
      lightLogo: lightLogo || {},
      darkLogo: darkLogo || {},
      mainPoster: mainPoster || {},
      about: about || {},
      contact: contact || {},
      socialLinks: socialLinks || {},
    });

    return res.status(201).json({
      success: true,
      message: "Website settings created successfully.",
      website,
    });
  } catch (error) {
    console.error("Create website error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create website settings.",
    });
  }
};

const updateWebsite = async (req, res) => {
  try {
    const website = await Website.findOne();

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website settings not found.",
      });
    }

    const {
      websiteName,
      favicon,
      lightLogo,
      darkLogo,
      mainPoster,
      about,
      contact,
      socialLinks,
    } = req.body;

    if (websiteName !== undefined) {
      if (!websiteName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Website name cannot be empty.",
        });
      }

      website.websiteName = websiteName.trim();
    }

    if (favicon !== undefined) {
      website.favicon = {
        ...(website.favicon?.toObject?.() || {}),
        ...favicon,
      };
    }

    if (lightLogo !== undefined) {
      website.lightLogo = {
        ...(website.lightLogo?.toObject?.() || {}),
        ...lightLogo,
      };
    }

    if (darkLogo !== undefined) {
      website.darkLogo = {
        ...(website.darkLogo?.toObject?.() || {}),
        ...darkLogo,
      };
    }

    if (mainPoster !== undefined) {
      website.mainPoster = {
        ...(website.mainPoster?.toObject?.() || {}),
        ...mainPoster,
      };
    }

    if (about !== undefined) {
      website.about = {
        ...(website.about?.toObject?.() || {}),
        ...about,
      };

      if (about.image !== undefined) {
        website.about.image = {
          ...(website.about.image?.toObject?.() || {}),
          ...about.image,
        };
      }
    }

    if (contact !== undefined) {
      website.contact = {
        ...(website.contact?.toObject?.() || {}),
        ...contact,
      };
    }

    if (socialLinks !== undefined) {
      website.socialLinks = {
        ...(website.socialLinks?.toObject?.() || {}),
        ...socialLinks,
      };
    }

    await website.save();

    return res.status(200).json({
      success: true,
      message: "Website settings updated successfully.",
      website,
    });
  } catch (error) {
    console.error("Update website error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save website settings.",
    });
  }
};

const getPublicWebsite = async (req, res) => {
  try {
    const website = await Website.findOne().lean();

    if (!website) {
      return res.status(200).json({
        success: true,
        website: null,
      });
    }

    return res.status(200).json({
      success: true,
      website,
    });
  } catch (error) {
    console.error("Get public website error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch website information.",
    });
  }
};

export {
  getWebsite,
  createWebsite,
  updateWebsite,
  uploadWebsiteImage,
  deleteWebsiteImage,
  getPublicWebsite,
};
