import express from "express";

import {
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  updateClass,
} from "../controllers/class.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const classRouter = express.Router();

classRouter.use(adminAuth);

classRouter.post("/", createClass);
classRouter.get("/", getClasses);
classRouter.get("/:id", getClassById);
classRouter.put("/:id", updateClass);
classRouter.delete("/:id", deleteClass);

export default classRouter;
