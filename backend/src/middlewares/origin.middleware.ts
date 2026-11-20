import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const verifyRequestOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");

  if (origin && origin !== env.frontendOrigin) {
    next(new ApiError(403, "ORIGIN_NOT_ALLOWED", "Request origin is not allowed."));
    return;
  }

  next();
};
