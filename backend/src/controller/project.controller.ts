import type { Request, Response } from "express";
import { ApiError } from "../utils/api-error.ts";
import { getAuthenticatedUserId } from "../middlewares/auth.middleware.ts";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "../schemas/project.schema.ts";
import {
  createProjectService,
  deleteProjectService,
  getProjectService,
  getProjectsService,
  updateProjectService,
} from "../services/project.service.ts";
import { getValidationMessage } from "../utils/validation.ts";

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
