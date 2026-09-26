import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controller/project.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.ts";

const projectRouter = Router();

projectRouter.get("/", authenticate, getProjects);
projectRouter.post("/", verifyRequestOrigin, authenticate, createProject);
projectRouter.get("/:projectId", authenticate, getProject);
projectRouter.patch("/:projectId", verifyRequestOrigin, authenticate, updateProject);
projectRouter.delete("/:projectId", verifyRequestOrigin, authenticate, deleteProject);

export default projectRouter;
