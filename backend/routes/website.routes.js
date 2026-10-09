import express from "express";

import {
  getWebsite,
  createWebsite,
  updateWebsite,
  uploadWebsiteImage,
  deleteWebsiteImage,
  getPublicWebsite,
} from "../controllers/website.controller.js";

import adminAuth from "../middleware/adminAuth.middleware.js";
import upload from "../middleware/upload.js";

const websiteRouter = express.Router();

// Get website settings
websiteRouter.get("/", adminAuth, getWebsite);

// Create website settings
websiteRouter.post("/", adminAuth, createWebsite);

// Update website settings
websiteRouter.put("/", adminAuth, updateWebsite);

// Upload website image
websiteRouter.post(
  "/upload-image",
  adminAuth,
  upload.single("image"),
  uploadWebsiteImage,
);

// Delete website image
websiteRouter.delete("/delete-image", adminAuth, deleteWebsiteImage);

websiteRouter.get("/public", getPublicWebsite);

export default websiteRouter;
