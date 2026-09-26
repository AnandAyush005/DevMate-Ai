import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request, Response } from "express";
import { ApiError } from "../../../src/utils/api-error.ts";

process.env.JWT_SECRET ??= "test-only-jwt-secret-with-at-least-32-bytes";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";

const { createProject, getProject } = await import("../../../src/controller/project.controller.ts");

describe("project controllers", () => {
  it("rejects invalid create bodies before reaching the service", async () => {
    const request = { body: { name: " " } } as unknown as Request;
    await assert.rejects(
      createProject(request, {} as Response),
      (error: unknown) => error instanceof ApiError && error.statusCode === 400,
    );
  });

  it("rejects malformed project IDs before reaching the service", async () => {
    const request = { params: { projectId: "not-a-uuid" } } as unknown as Request;
    await assert.rejects(
      getProject(request, {} as Response),
      (error: unknown) => error instanceof ApiError && error.statusCode === 400,
    );
  });
});
