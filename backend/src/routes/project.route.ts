import { Router } from "express";
import {
  createProject,
  createProjectFile,
  deleteProject,
  getProject,
  getProjectFileContent,
  getProjectFiles,
  getProjects,
  updateProject,
  updateProjectFileContent
} from "../controller/project.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.ts";

const projectRouter = Router();

projectRouter.get("/", authenticate, getProjects);
projectRouter.post("/", verifyRequestOrigin, authenticate, createProject);
projectRouter.get("/:projectId/files", authenticate, getProjectFiles);
projectRouter.get("/:projectId", authenticate, getProject);
projectRouter.post("/:projectId/files", verifyRequestOrigin, authenticate, createProjectFile)
projectRouter.patch("/:projectId", verifyRequestOrigin, authenticate, updateProject);
projectRouter.delete("/:projectId", verifyRequestOrigin, authenticate, deleteProject);
projectRouter.get('/:projectId/files/:fileId', verifyRequestOrigin, authenticate, getProjectFileContent);  
projectRouter.patch(
  "/:projectId/files/:fileId",
  verifyRequestOrigin,
  authenticate,
  updateProjectFileContent
);


export default projectRouter;
