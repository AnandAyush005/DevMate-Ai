import { Router } from "express";
import {
  createProject,
  createProjectFile,
  deleteProject,
  deleteProjectFile,
  deleteProjectFolder,
  getProject,
  getProjectFileContent,
  getProjectFiles,
  getProjects,
  updateProject,
  updateProjectFileContent,
  createProjectFolder,
  getProjectFolders,
  updateProjectFolder,
} from "../controller/project.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyRequestOrigin } from "../middlewares/origin.middleware.js";

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
projectRouter.delete(
  "/:projectId/files/:fileId",
  verifyRequestOrigin,
  authenticate,
  deleteProjectFile,
);

projectRouter.get(
  "/:projectId/folders",
  authenticate,
  getProjectFolders,
);

projectRouter.post(
  "/:projectId/folders",
  verifyRequestOrigin,
  authenticate,
  createProjectFolder,
);

projectRouter.patch(
  "/:projectId/folders/:folderId",
  verifyRequestOrigin,
  authenticate,
  updateProjectFolder,
);
projectRouter.delete(
  "/:projectId/folders/:folderId",
  verifyRequestOrigin,
  authenticate,
  deleteProjectFolder,
);

export default projectRouter;
