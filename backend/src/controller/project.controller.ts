import type { Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { getAuthenticatedUserId } from "../middlewares/auth.middleware.js";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "../schemas/project.schema.js";
import {
  createProjectFolderSchema,
  projectFolderIdParamSchema,
  updateProjectFolderSchema,
} from "../schemas/project-folder.schema.js";
import {
  createProjectService,
  deleteProjectService,
  getProjectFilesService,
  getProjectService,
  getProjectsService,
  updateProjectService,
  createProjectFileService,
  getProjectFileContentService,
  updateProjectFileService,
  getProjectFoldersService,
  createProjectFolderService,
  updateProjectFolderService,
} from "../services/project.service.js";
import { getValidationMessage } from "../utils/validation.js";
import { createProjectFileSchema, getProjectFileContentSchema, updateProjectFileSchema } from "../schemas/project-file.schema.js";

export const createProject = async (req: Request, res: Response) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const project = await createProjectService(getAuthenticatedUserId(req), parsed.data);
  return res.status(201).json({ success: true, data: project });
};

export const getProjects = async (req: Request, res: Response) => {
  const projects = await getProjectsService(getAuthenticatedUserId(req));
  return res.status(200).json({ success: true, data: projects });
};

export const getProject = async (req: Request, res: Response) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);
  if (!projectId.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(projectId.error));
  }

  const project = await getProjectService(getAuthenticatedUserId(req), projectId.data);
  return res.status(200).json({ success: true, data: project });
};

export const updateProject = async (req: Request, res: Response) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);
  if (!projectId.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(projectId.error));
  }

  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const project = await updateProjectService(
    getAuthenticatedUserId(req),
    projectId.data,
    parsed.data,
  );
  return res.status(200).json({ success: true, data: project });
};

export const deleteProject = async (req: Request, res: Response) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);
  if (!projectId.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(projectId.error));
  }

  await deleteProjectService(getAuthenticatedUserId(req), projectId.data);
  return res.status(200).json({ success: true, data: { id: projectId.data } });
};

export const getProjectFiles = async (req: Request, res: Response) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);
  if (!projectId.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(projectId.error));
  }

  const projectFiles = await getProjectFilesService(getAuthenticatedUserId(req), projectId.data);
  return res.status(200).json({ success: true, data: { files: [...projectFiles] } });
};

export const createProjectFile = async(req:Request, res : Response)=>{

  const projectId = projectIdSchema.safeParse(req.params.projectId);
  if (!projectId.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(projectId.error));
  }

  const file = createProjectFileSchema.safeParse(req.body);
  
  if(!file.success){
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(file.error));
  }

  const createdFile = await createProjectFileService(getAuthenticatedUserId(req), projectId.data, file.data);

  return res.status(201).json({
    success : true,
    data : createdFile
  })

}


export const getProjectFileContent = async (
  req: Request,
  res: Response
) => {
  const result = getProjectFileContentSchema.safeParse(req.params);

  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(result.error)
    );
  }

  const fileData = await getProjectFileContentService(
    getAuthenticatedUserId(req),
    result.data.projectId,
    result.data.fileId
  );

  return res.status(200).json({
    success: true,
    data: fileData,
  });
};

export const updateProjectFileContent = async (req: Request, res: Response) => {
  const result = getProjectFileContentSchema.safeParse(req.params);

  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(result.error)
    );
  }

  const data = updateProjectFileSchema.safeParse(req.body);

  if (!data.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(data.error)
    );
  }

  const updateProjectFile = await updateProjectFileService(
    getAuthenticatedUserId(req),
    result.data.projectId,
    result.data.fileId,
    data.data
  );

  return res.status(200).json({
    success: true,
    data: updateProjectFile,
  });
};

export const updateProjectFile = updateProjectFileContent;

export const updateProjectFolder = async (
  req: Request,
  res: Response,
) => {
  const params = projectFolderIdParamSchema.safeParse(req.params);

  if (!params.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(params.error),
    );
  }

  const parsed = updateProjectFolderSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(parsed.error),
    );
  }

  const folder = await updateProjectFolderService(
    getAuthenticatedUserId(req),
    params.data.projectId,
    params.data.folderId,
    parsed.data,
  );

  return res.status(200).json({
    success: true,
    data: folder,
  });
};



export const getProjectFolders = async (
  req: Request,
  res: Response,
) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);

  if (!projectId.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(projectId.error),
    );
  }

  const folders = await getProjectFoldersService(
    getAuthenticatedUserId(req),
    projectId.data,
  );

  return res.status(200).json({
    success: true,
    data: folders,
  });
};

export const createProjectFolder = async (
  req: Request,
  res: Response,
) => {
  const projectId = projectIdSchema.safeParse(req.params.projectId);

  if (!projectId.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(projectId.error),
    );
  }

  const parsed = createProjectFolderSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      getValidationMessage(parsed.error),
    );
  }

  const folder = await createProjectFolderService(
    getAuthenticatedUserId(req),
    projectId.data,
    parsed.data.name,
    parsed.data.parentFolderId,
  );

  return res.status(201).json({
    success: true,
    data: folder,
  });
};
