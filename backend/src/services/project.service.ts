import type { z } from "zod";
import { ApiError } from "../utils/api-error.ts";
import { db } from "../prisma/db.ts";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema.ts";
import { isUniqueConstraintViolation } from "./database-error.service.ts";

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createProjectService = async (userId: string, data: CreateProjectInput) => {
  try {
    return await db.orm.public.Project.create({
      ...data,
      userId,
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(409, "PROJECT_NAME_TAKEN", "A project with this name already exists.");
    }
    throw error;
  }
};

export const getProjectsService = async (userId: string) =>
  db.orm.public.Project
    .where({ userId })
    .orderBy((project) => project.createdAt.desc())
    .all();

export const getProjectService = async (userId: string, projectId: string) => {
  const project = await db.orm.public.Project
    .where({ id: projectId, userId })
    .first();

  if (!project) {
    throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
  }

  return project;
};

export const updateProjectService = async (
  userId: string,
  projectId: string,
  data: UpdateProjectInput,
) => {
  const ownedProject = await db.orm.public.Project
    .where({ id: projectId, userId })
    .first();

  if (!ownedProject) {
    throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
  }

  try {
    const updated = await db.orm.public.Project
      .where({ id: projectId, userId })
      .update(data);
    if (!updated) {
      throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
    }
    return updated;
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(409, "PROJECT_NAME_TAKEN", "A project with this name already exists.");
    }
    throw error;
  }
};

export const deleteProjectService = async (userId: string, projectId: string) => {
  const project = await db.orm.public.Project
    .where({ id: projectId, userId })
    .first();

  if (!project) {
    throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
  }

  await db.orm.public.Project
    .where({ id: projectId, userId })
    .delete();
};
