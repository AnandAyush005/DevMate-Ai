
import { z } from "zod";

export const executeCodeSchema = z.object({
  code: z.string().min(1).max(100_000),
  language: z.string().trim().min(1).max(50),
  stdin: z.string().max(20_000).optional().default(""),
}).strict();

export type ExecuteCodeInput = z.infer<typeof executeCodeSchema>;
