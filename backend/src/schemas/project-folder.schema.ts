import { z } from "zod";

export const createProjectFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required.")
    .max(100, "Folder name must not exceed 100 characters.")
    .refine(
      (name) => !/[\\/]/.test(name) && name !== "." && name !== "..",
      "Folder name cannot contain path separators.",
    ),

  parentFolderId: z.uuid("Invalid parent folder ID.").optional(),
});

