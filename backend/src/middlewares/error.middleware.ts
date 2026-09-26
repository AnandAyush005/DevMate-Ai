import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/api-error.ts";

export const notFoundMiddleware: RequestHandler = (_req, res) =>
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  });

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  if (isMalformedJsonError(error)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body must contain valid JSON." },
    });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." },
  });
};

const isMalformedJsonError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "type" in error &&
  error.type === "entity.parse.failed";
