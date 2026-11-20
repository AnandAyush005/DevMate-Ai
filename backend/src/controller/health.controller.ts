import type { Request, Response } from "express";
import { healthCheckService } from "../services/health.service.js";

export const healthCheck = async (_req: Request, res: Response) => {
  const health = healthCheckService();
  return res.status(200).json({
    success: true,
    data: { ...health, message: "Health check passed" },
  });
};
