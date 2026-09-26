import type { ZodError } from "zod";

export const getValidationMessage = (error: ZodError) =>
  error.issues[0]?.message ?? "Request validation failed.";
