import type { Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { executeCodeSchema } from "../schemas/compiler.schema.js";
import { executeCode } from "../services/compiler.service.ts";
import { getValidationMessage } from "../utils/validation.js";

export const runCode = async (req: Request, res: Response) => {
  const parsed = executeCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const result = await executeCode(parsed.data);
  return res.status(200).json({ success: true, data: result });
};
