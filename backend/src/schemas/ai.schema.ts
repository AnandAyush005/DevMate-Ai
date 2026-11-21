import { z } from "zod";

export const generateAIRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(20_000),
}).strict();
