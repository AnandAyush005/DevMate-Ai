
import { z } from "zod";

export const createProjectFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "File name is required.")
    .max(100, "File name must not exceed 100 characters."),

  folderId: z
    .uuid("Invalid folder ID.")
    .optional(),

  content: z.string(),

  language: z
    .string()
    .trim()
    .min(1, "Language is required.")
    .max(50, "Language must not exceed 50 characters."),
});

export const getProjectFileContentSchema = z.object({
  projectId: z.uuid("Invalid project ID."),
  fileId: z.uuid("Invalid file ID."),
});

export const updateProjectFileSchema = z.object({
  content: z.string(),
});
