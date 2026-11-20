
import { z } from "zod";

export const createProjectFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "File name is required.")
    .max(100, "File name must not exceed 100 characters.")
    .refine(
      (name) => !/[\\/]/.test(name) && name !== "." && name !== "..",
      "File name cannot contain path separators.",
    ),

  folderId: z
    .uuid("Invalid folder ID.")
    .optional(),

  content: z.string().optional().default(""),

  language: z
    .string()
    .trim()
    .min(1, "Language is required.")
    .max(50, "Language must not exceed 50 characters.")
    .optional(),
});

export const getProjectFileContentSchema = z.object({
  projectId: z.uuid("Invalid project ID."),
  fileId: z.uuid("Invalid file ID."),
});

export const updateProjectFileSchema = z
  .object({
    content: z.string().optional(),
    name: z
      .string()
      .trim()
      .min(1, "File name is required.")
      .max(100, "File name must not exceed 100 characters.")
      .refine(
        (name) => !/[\\/]/.test(name) && name !== "." && name !== "..",
        "File name cannot contain path separators.",
      )
      .optional(),
    folderId: z.uuid("Invalid folder ID.").optional(),
  })
  .refine(
    (data) =>
      data.content !== undefined ||
      data.name !== undefined ||
      data.folderId !== undefined,
    { message: "At least one of content, name, or folder ID must be provided." },
  );
