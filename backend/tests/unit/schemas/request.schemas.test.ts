import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resetPasswordTokenParamSchema,
} from "../../../src/schemas/auth.schema.ts";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} from "../../../src/schemas/project.schema.ts";
import { updateProjectFileSchema } from "../../../src/schemas/project-file.schema.ts";
import { updateProjectFolderSchema } from "../../../src/schemas/project-folder.schema.ts";

describe("request schemas", () => {
  it("normalizes registration and login emails and rejects extra properties", () => {
    assert.deepEqual(registerSchema.parse({
      name: " Test User ",
      email: " USER@example.test ",
      password: "a-long-password",
    }), {
      name: "Test User",
      email: "user@example.test",
      password: "a-long-password",
    });
    assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
    assert.equal(registerSchema.safeParse({
      name: "User",
      email: "user@example.test",
      password: "a-long-password",
      role: "admin",
    }).success, false);
    assert.deepEqual(
      forgotPasswordSchema.parse({ email: " USER@example.test " }),
      { email: "user@example.test" },
    );
    assert.equal(
      resetPasswordSchema.safeParse({
        password: "a-long-password",
        confirmPassword: "a-different-password",
      }).success,
      false,
    );
    assert.equal(
      resetPasswordSchema.safeParse({
        password: "a-long-password",
        confirmPassword: "a-long-password",
      }).success,
      true,
    );
    assert.equal(resetPasswordTokenParamSchema.safeParse("short").success, false);
    assert.equal(resetPasswordTokenParamSchema.safeParse("a".repeat(32)).success, true);
  });

  it("validates project create, update, and UUID input", () => {
    assert.deepEqual(
      createProjectSchema.parse({ name: " Project ", description: null }),
      { name: "Project", description: null },
    );
    assert.equal(createProjectSchema.safeParse({ name: " " }).success, false);
    assert.equal(updateProjectSchema.safeParse({}).success, false);
    assert.equal(updateProjectSchema.safeParse({ unexpected: true }).success, false);
    assert.equal(updateProjectSchema.safeParse({ description: null }).success, true);
    assert.equal(projectIdSchema.safeParse(crypto.randomUUID()).success, true);
    assert.equal(projectIdSchema.safeParse("invalid").success, false);
  });

  it("accepts file and folder relocation payloads and rejects empty updates", () => {
    const folderId = crypto.randomUUID();
    assert.deepEqual(updateProjectFileSchema.parse({ folderId }), { folderId });
    assert.equal(updateProjectFileSchema.safeParse({}).success, false);
    assert.deepEqual(
      updateProjectFolderSchema.parse({ parentFolderId: folderId }),
      { parentFolderId: folderId },
    );
    assert.equal(updateProjectFolderSchema.safeParse({}).success, false);
  });
});
