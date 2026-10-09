import express from "express";

import {
  adminLogin,
  adminLogout,
  deleteAdminProfileImage,
  getAdmin,
  updateAdminProfile,
  uploadAdminProfileImage,
} from "../controllers/admin.controller.js";

import adminAuth from "../middleware/adminAuth.middleware.js";
import upload from "../middleware/upload.js";

const adminRouter = express.Router();

// Admin authentication
adminRouter.post("/login", adminLogin);

adminRouter.post("/logout", adminAuth, adminLogout);

adminRouter.get("/get-admin", adminAuth, getAdmin);

// Admin profile
adminRouter.put("/profile", adminAuth, updateAdminProfile);

// Admin profile image
adminRouter.post(
  "/profile/image",
  adminAuth,
  upload.single("image"),
  uploadAdminProfileImage,
);

adminRouter.delete("/profile/image", adminAuth, deleteAdminProfileImage);

export default adminRouter;
