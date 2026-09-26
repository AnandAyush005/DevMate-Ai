import type { Request, Response } from "express";
import { healthCheckService } from "../services/health.service.ts";

export const healthCheck = async (_req: Request, res: Response) => {
  await healthCheckService();
  return res.status(200).json({
    success: true,
    data: { status: "ok", message: "Health check passed" },
  });
};
