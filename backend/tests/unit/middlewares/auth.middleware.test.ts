import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../src/utils/api-error.ts";

process.env.JWT_SECRET ??= "test-only-jwt-secret-with-at-least-32-bytes";
process.env.FRONTEND_URL ??= "http://localhost:3000";

const { authConfig } = await import("../../../src/config/auth.ts");
const { authenticate } = await import("../../../src/middlewares/auth.middleware.ts");
const { createAuthToken } = await import("../../../src/services/auth-token.service.ts");

const runMiddleware = (cookie?: string) => {
  const request = { headers: { cookie } } as Request;
  let error: unknown;
  const next: NextFunction = (nextError) => {
    error = nextError;
  };
  authenticate(request, {} as Response, next);
  return { request, error };
};

describe("authentication middleware", () => {
  it("rejects missing and invalid cookies", () => {
    const missing = runMiddleware();
    assert.ok(missing.error instanceof ApiError);
    assert.equal(missing.request.authenticatedUserId, undefined);

    const invalid = runMiddleware(`${authConfig.cookieName}=invalid.token`);
    assert.ok(invalid.error instanceof ApiError);
  });

  it("attaches the subject from a valid auth token", () => {
    const token = createAuthToken("user-123");
    const authenticated = runMiddleware(`${authConfig.cookieName}=${token}`);
    assert.equal(authenticated.error, undefined);
    assert.equal(authenticated.request.authenticatedUserId, "user-123");
  });
});
