import { z } from "zod";

const projectFields = {
  name: z.string().trim().min(1, "Project name is required").max(500),
  description: z.string().trim().max(500).nullable(),
};

export const createProjectSchema = z.object({
  name: projectFields.name,
  description: projectFields.description.optional(),
}).strict();

export const updateProjectSchema = z.object({
  name: projectFields.name.optional(),
  description: projectFields.description.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "At least one project field must be provided.",
});

export const projectIdSchema = z.string().uuid();
