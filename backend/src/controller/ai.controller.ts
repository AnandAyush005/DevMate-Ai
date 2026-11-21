import type { Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { generateAIRequestSchema } from "../schemas/ai.schema.js";
import { generateAIResponse } from "../services/ai.service.ts";
import { getValidationMessage } from "../utils/validation.js";

export const generateAI = async (req: Request, res: Response) => {
  const parsed = generateAIRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", getValidationMessage(parsed.error));
  }

  const text = await generateAIResponse(parsed.data.prompt);
  return res.status(200).json({ success: true, data: { text } });
};
