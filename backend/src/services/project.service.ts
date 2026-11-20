
import type { z } from "zod";
import { ApiError } from "../utils/api-error.js";
import { db } from "../prisma/db.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../schemas/project.schema.js";
import { isUniqueConstraintViolation } from "./database-error.service.js";
import { createProjectFileSchema } from "../schemas/project-file.schema.js";

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
type CreateProjectFileInput = z.infer<typeof createProjectFileSchema>;

// --------------------------------------------------
// PROJECT SERVICES
// --------------------------------------------------

export const createProjectService = async (
  userId: string,
  data: CreateProjectInput,
) => {
  try {
    return await db.orm.public.Project.create({
      ...data,
      userId,
      projectFolder: (folder) =>
        folder.create({
          name: "root",
          path: "/",
        }),
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(
        409,
        "PROJECT_NAME_TAKEN",
        "A project with this name already exists.",
      );
    }

    throw error;
  }
};

export const getProjectsService = async (userId: string) =>
  db.orm.public.Project
    .where({ userId })
    .orderBy((project) => project.createdAt.desc())
    .all();

export const getProjectService = async (
  userId: string,
  projectId: string,
) => {
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
  await getProjectService(userId, projectId);

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
      throw new ApiError(
        409,
        "PROJECT_NAME_TAKEN",
        "A project with this name already exists.",
      );
    }

    throw error;
  }
};

export const deleteProjectService = async (
  userId: string,
  projectId: string,
) => {
  await getProjectService(userId, projectId);

  await db.orm.public.Project
    .where({ id: projectId, userId })
    .delete();
};

// --------------------------------------------------
// FOLDER SERVICES
// --------------------------------------------------

export const getProjectFoldersService = async (
  userId: string,
  projectId: string,
) => {
  await getProjectService(userId, projectId);

  return db.orm.public.ProjectFolder
    .where({ projectId })
    .orderBy((folder) => folder.path.asc())
    .all();
};


export const getLanguageFromFileName = (fileName: string): string => {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  switch (extension) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

export const createProjectFolderService = async (
  userId: string,
  projectId: string,
  name: string,
  parentFolderId?: string,
) => {
  // 1. Confirm that the project belongs to the user.
  await getProjectService(userId, projectId);

  // 2. Find the parent folder, or use the project's root folder.
  const parentFolder = parentFolderId
    ? await db.orm.public.ProjectFolder
        .where({ id: parentFolderId, projectId })
        .first()
    : await db.orm.public.ProjectFolder
        .where({ projectId, path: "/" })
        .first();

  if (!parentFolder) {
    throw new ApiError(
      404,
      parentFolderId ? "PARENT_FOLDER_NOT_FOUND" : "ROOT_FOLDER_NOT_FOUND",
      parentFolderId
        ? "Parent folder not found in this project."
        : "The project's root folder has not been initialized.",
    );
  }

  // 3. Validate the folder name.
  const trimmedName = name.trim();

  if (
    !trimmedName ||
    trimmedName.length > 100 ||
    /[/\\]/.test(trimmedName) ||
    trimmedName === "." ||
    trimmedName === ".."
  ) {
    throw new ApiError(
      400,
      "INVALID_FOLDER_NAME",
      "Folder name must be 1–100 characters and cannot contain path separators.",
    );
  }

  // 4. Calculate the folder path.
  const path =
    parentFolder.path === "/"
      ? `/${trimmedName}/`
      : `${parentFolder.path}${trimmedName}/`;

  try {
    return await db.orm.public.ProjectFolder.create({
      name: trimmedName,
      path,
      projectId,
      parentFolderId: parentFolder.id,
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(
        409,
        "FOLDER_ALREADY_EXISTS",
        "A folder with this path already exists.",
      );
    }

    throw error;
  }
};

export const updateProjectFolderService = async (
  userId: string,
  projectId: string,
  folderId: string,
  data: { name?: string; parentFolderId?: string },
) => {
  await getProjectService(userId, projectId);

  const folder = await db.orm.public.ProjectFolder
    .where({ id: folderId, projectId })
    .first();

  if (!folder) {
    throw new ApiError(404, "FOLDER_NOT_FOUND", "Folder not found in this project.");
  }

  if (folder.path === "/" || !folder.parentFolderId) {
    throw new ApiError(
      400,
      "CANNOT_MODIFY_ROOT",
      "Cannot rename or relocate the root folder.",
    );
  }

  const trimmedName = data.name?.trim();

  if (data.name !== undefined) {
    if (
      !trimmedName ||
      trimmedName.length > 100 ||
      /[/\\]/.test(trimmedName) ||
      trimmedName === "." ||
      trimmedName === ".."
    ) {
      throw new ApiError(
        400,
        "INVALID_FOLDER_NAME",
        "Folder name must be 1–100 characters and cannot contain path separators.",
      );
    }
  }

  const nextParentFolderId = data.parentFolderId ?? folder.parentFolderId;
  if (!nextParentFolderId) {
    throw new ApiError(400, "CANNOT_RELOCATE_ROOT", "Cannot relocate the root folder.");
  }

  const parentFolder = await db.orm.public.ProjectFolder
    .where({ id: nextParentFolderId, projectId })
    .first();

  if (!parentFolder) {
    throw new ApiError(404, "PARENT_FOLDER_NOT_FOUND", "Parent folder not found.");
  }

  if (parentFolder.path.startsWith(folder.path)) {
    throw new ApiError(
      400,
      "CANNOT_MOVE_FOLDER_INTO_DESCENDANT",
      "A folder cannot be moved into itself or one of its subfolders.",
    );
  }

  const nextName = trimmedName ?? folder.name;
  const newPath =
    parentFolder.path === "/"
      ? `/${nextName}/`
      : `${parentFolder.path}${nextName}/`;

  const allFolders = await db.orm.public.ProjectFolder
    .where({ projectId })
    .all();
  const descendants = allFolders.filter(
    (candidate) =>
      candidate.id === folder.id || candidate.path.startsWith(folder.path),
  );
  const descendantIds = new Set(descendants.map((candidate) => candidate.id));
  const relocatedPaths = descendants.map((candidate) =>
    candidate.id === folder.id
      ? newPath
      : `${newPath}${candidate.path.slice(folder.path.length)}`,
  );
  const relocatedPathSet = new Set(relocatedPaths);
  const hasDuplicateRelocatedPaths =
    relocatedPathSet.size !== relocatedPaths.length;
  const conflictsWithExistingFolder = allFolders.some(
    (candidate) =>
      !descendantIds.has(candidate.id) && relocatedPathSet.has(candidate.path),
  );

  if (hasDuplicateRelocatedPaths || conflictsWithExistingFolder) {
    throw new ApiError(
      409,
      "FOLDER_ALREADY_EXISTS",
      "A folder with this name already exists in the destination folder.",
    );
  }

  try {
    const updated = await db.orm.public.ProjectFolder
      .where({ id: folderId, projectId })
      .update({
        name: nextName,
        path: newPath,
        parentFolderId: parentFolder.id,
      });

    if (!updated) {
      throw new ApiError(404, "FOLDER_NOT_FOUND", "Folder not found in this project.");
    }

    if (folder.path !== newPath) {
      for (const descendant of descendants) {
        if (descendant.id !== folder.id) {
          const relocatedPath = `${newPath}${descendant.path.slice(folder.path.length)}`;
          await db.orm.public.ProjectFolder
            .where({ id: descendant.id, projectId })
            .update({ path: relocatedPath });
        }
      }
    }

    return updated;
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(
        409,
        "FOLDER_ALREADY_EXISTS",
        "A folder with this path already exists.",
      );
    }

    throw error;
  }
};


export const deleteProjectFolderService = async (
  userId: string,
  projectId: string,
  folderId: string,
) => {
  await getProjectService(userId, projectId);

  const folder = await db.orm.public.ProjectFolder
    .where({ id: folderId, projectId })
    .first();

  if (!folder) {
    throw new ApiError(404, "FOLDER_NOT_FOUND", "Folder not found in this project.");
  }

  if (folder.path === "/" || !folder.parentFolderId) {
    throw new ApiError(400, "CANNOT_DELETE_ROOT", "Cannot delete the root folder.");
  }

  await db.orm.public.ProjectFolder
    .where({ id: folderId, projectId })
    .delete();
};

// --------------------------------------------------
// FILE SERVICES
// --------------------------------------------------

export const getProjectFilesService = async (
  userId: string,
  projectId: string,
) => {
  await getProjectService(userId, projectId);

  const folders = await db.orm.public.ProjectFolder
    .where({ projectId })
    .all();

  const filesByFolder = await Promise.all(
    folders.map(async (folder) => {
      const files = await db.orm.public.ProjectFile
        .where({ folderId: folder.id })
        .orderBy((file) => file.name.asc())
        .all();

      return files.map((file) => ({
        ...file,
        folderPath: folder.path,
        path:
          folder.path === "/"
            ? `/${file.name}`
            : `${folder.path}${file.name}`,
      }));
    }),
  );

  return filesByFolder.flat();
};

export const createProjectFileService = async (
  userId: string,
  projectId: string,
  data: CreateProjectFileInput,
) => {
  await getProjectService(userId, projectId);

  // Files without an explicit folder are placed in the root folder.
  const rootFolder = await db.orm.public.ProjectFolder
    .where({ projectId, path: "/" })
    .first();

  if (!rootFolder) {
    throw new ApiError(
      500,
      "ROOT_FOLDER_NOT_FOUND",
      "The project's root folder has not been initialized.",
    );
  }

  const folderId = data.folderId ?? rootFolder.id;

  const folder = await db.orm.public.ProjectFolder
    .where({ id: folderId, projectId })
    .first();

  if (!folder) {
    throw new ApiError(
      404,
      "FOLDER_NOT_FOUND",
      "Folder not found in this project.",
    );
  }

  const language = data.language || getLanguageFromFileName(data.name);

  try {
    return await db.orm.public.ProjectFile.create({
      name: data.name,
      content: data.content ?? "",
      language,
      folderId: folder.id,
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(
        409,
        "PROJECT_FILE_EXISTS",
        "A file with this name already exists in the folder.",
      );
    }

    throw error;
  }
};

export const getProjectFileContentService = async (
  userId: string,
  projectId: string,
  fileId: string,
) => {
  await getProjectService(userId, projectId);

  const file = await db.orm.public.ProjectFile
    .where({ id: fileId })
    .first();

  if (!file) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
  }

  if (!file.folderId) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
  }

  const folder = await db.orm.public.ProjectFolder
    .where({
      id: file.folderId,
      projectId,
    })
    .first();

  if (!folder) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
  }

  return {
    id: file.id,
    content: file.content,
  };
};

export const updateProjectFileService = async (
  userId: string,
  projectId: string,
  fileId: string,
  data: { content?: string; name?: string; folderId?: string },
) => {
  await getProjectService(userId, projectId);

  const file = await db.orm.public.ProjectFile
    .where({ id: fileId })
    .first();

  if (!file?.folderId) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
  }

  const folder = await db.orm.public.ProjectFolder
    .where({
      id: file.folderId,
      projectId,
    })
    .first();

  if (!folder) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
  }

  const updateData: {
    content?: string;
    name?: string;
    language?: string;
    folderId?: string;
  } = {};

  if (data.content !== undefined) {
    updateData.content = data.content;
  }

  if (data.folderId !== undefined) {
    const destinationFolder = await db.orm.public.ProjectFolder
      .where({ id: data.folderId, projectId })
      .first();

    if (!destinationFolder) {
      throw new ApiError(
        404,
        "FOLDER_NOT_FOUND",
        "Destination folder not found in this project.",
      );
    }

    updateData.folderId = destinationFolder.id;
  }

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName || trimmedName.length > 100 || /[/\\]/.test(trimmedName)) {
      throw new ApiError(
        400,
        "INVALID_FILE_NAME",
        "File name must be 1–100 characters and cannot contain path separators.",
      );
    }
    updateData.name = trimmedName;
    updateData.language = getLanguageFromFileName(trimmedName);
  }

  try {
    const updated = await db.orm.public.ProjectFile
      .where({ id: fileId, folderId: file.folderId })
      .update(updateData);

    if (!updated) {
      throw new ApiError(404, "FILE_NOT_FOUND", "File not found.");
    }

    return {
      id: fileId,
      name: updated.name,
      content: updated.content,
      language: updated.language,
      folderId: updated.folderId,
    };
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(
        409,
        "PROJECT_FILE_EXISTS",
        "A file with this name already exists in the folder.",
      );
    }

    throw error;
  }
};

export const deleteProjectFileService = async (
  userId: string,
  projectId: string,
  fileId: string,
) => {
  await getProjectService(userId, projectId);

  const file = await db.orm.public.ProjectFile
    .where({ id: fileId })
    .first();

  if (!file?.folderId) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found in this project.");
  }

  const folder = await db.orm.public.ProjectFolder
    .where({ id: file.folderId, projectId })
    .first();

  if (!folder) {
    throw new ApiError(404, "FILE_NOT_FOUND", "File not found in this project.");
  }

  await db.orm.public.ProjectFile
    .where({ id: fileId, folderId: folder.id })
    .delete();
};
