import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

const users = new Map<string, User>();
const projects = new Map<string, Project>();
const mailCalls: { email: string; resetUrl: string }[] = [];

const matches = <T extends object>(record: T, where: Partial<T>) =>
  Object.entries(where).every(([key, value]) => record[key as keyof T] === value);

const duplicateKeyError = () =>
  Object.assign(new Error("duplicate key"), { code: "23505" });

const db = {
  orm: {
    public: {
      User: {
        where(where: Partial<User>) {
          const find = () => [...users.values()].find((user) => matches(user, where)) ?? null;
          return {
            first: async () => find(),
            select: (...fields: (keyof User)[]) => ({
              first: async () => {
                const user = find();
                if (!user) return null;
                return Object.fromEntries(fields.map((field) => [field, user[field]]));
              },
            }),
            update: async (data: Partial<User>) => {
              const user = find();
              if (!user) return null;
              const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
              users.set(updated.id, updated);
              return updated;
            },
          };
        },
        create: async (data: Omit<User, "id" | "createdAt" | "updatedAt">) => {
          if ([...users.values()].some((user) => user.email === data.email)) {
            throw duplicateKeyError();
          }
          const now = new Date().toISOString();
          const user = {
            ...data,
            passwordResetTokenHash: data.passwordResetTokenHash ?? null,
            passwordResetExpiresAt: data.passwordResetExpiresAt ?? null,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
          };
          users.set(user.id, user);
          return user;
        },
      },
      Project: {
        first: async () => [...projects.values()][0] ?? null,
        create: async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
          if (
            [...projects.values()].some(
              (project) => project.userId === data.userId && project.name === data.name,
            )
          ) {
            throw duplicateKeyError();
          }
          const now = new Date().toISOString();
          const project = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
          projects.set(project.id, project);
          return project;
        },
        where(where: Partial<Project>) {
          const find = () =>
            [...projects.values()].find((project) => matches(project, where)) ?? null;
          return {
            first: async () => find(),
            orderBy: (_order: unknown) => ({
              all: async () =>
                [...projects.values()]
                  .filter((project) => matches(project, where))
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
            }),
            update: async (data: Partial<Pick<Project, "name" | "description">>) => {
              const project = find();
              if (!project) return null;
              if (
                data.name !== undefined &&
                [...projects.values()].some(
                  (other) =>
                    other.id !== project.id &&
                    other.userId === project.userId &&
                    other.name === data.name,
                )
              ) {
                throw duplicateKeyError();
              }
              const updated = { ...project, ...data, updatedAt: new Date().toISOString() };
              projects.set(updated.id, updated);
              return updated;
            },
            delete: async () => {
              const project = find();
              if (project) projects.delete(project.id);
            },
          };
        },
      },
    },
  },
};

process.env.JWT_SECRET ??= "test-only-jwt-secret-with-at-least-32-bytes";
process.env.FRONTEND_URL ??= "http://localhost:3000";
process.env.COOKIE_SAME_SITE ??= "lax";

mock.module("../../../src/prisma/db.ts", { namedExports: { db } });
mock.module("../../../src/services/mail.service.ts", {
  namedExports: {
    sendPasswordResetEmail: async (email: string, resetUrl: string) => {
      mailCalls.push({ email, resetUrl });
    },
  },
});

const { default: app } = await import("../../../src/app.ts");

describe("API routes", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  beforeEach(() => {
    users.clear();
    projects.clear();
    mailCalls.length = 0;
  });

  const request = (path: string, init?: RequestInit) => fetch(`${baseUrl}${path}`, init);
  const jsonRequest = (method: string, body?: unknown, cookie?: string, origin?: string) =>
    request("/api/v1/projects", {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(cookie ? { cookie } : {}),
        ...(origin ? { origin } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  const register = async (email: string) => {
    const response = await request("/api/v1/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test User", email, password: "a-long-test-password" }),
    });
    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    return { response, cookie };
  };

  it("supports health, authentication, and isolated project CRUD across users", async () => {
    const health = await request("/api/v1/health");
    assert.equal(health.status, 200);
    assert.equal((await health.json() as { data: { status: string } }).data.status, "ok");

    const missingAuth = await request("/api/v1/projects");
    assert.equal(missingAuth.status, 401);

    const firstAccount = await register("first@example.test");
    assert.equal(firstAccount.response.status, 201);
    assert.match(firstAccount.cookie ?? "", /^devmate_auth=/);
    const firstAccountBody = await firstAccount.response.json() as { data: { email: string } };
    assert.equal(firstAccountBody.data.email, "first@example.test");
    assert.doesNotMatch(JSON.stringify(firstAccountBody), /passwordHash/);
    const firstCookie = firstAccount.cookie!;

    const duplicateAccount = await register("FIRST@example.test");
    assert.equal(duplicateAccount.response.status, 409);

    const me = await request("/api/v1/auth/me", { headers: { cookie: firstCookie } });
    assert.equal(me.status, 200);
    assert.equal((await me.json() as { data: { email: string } }).data.email, "first@example.test");
    const missingMe = await request("/api/v1/auth/me");
    assert.equal(missingMe.status, 401);

    const created = await jsonRequest(
      "POST",
      { name: "Shared name", description: "first owner's project" },
      firstCookie,
    );
    assert.equal(created.status, 201);
    const firstProject = (await created.json() as { data: Project }).data;

    const ownProject = await request(`/api/v1/projects/${firstProject.id}`, {
      headers: { cookie: firstCookie },
    });
    assert.equal(ownProject.status, 200);
    assert.equal((await ownProject.json() as { data: Project }).data.id, firstProject.id);

    const sameAccountDuplicate = await jsonRequest(
      "POST",
      { name: "Shared name" },
      firstCookie,
    );
    assert.equal(sameAccountDuplicate.status, 409);
    assert.equal(
      (await sameAccountDuplicate.json() as { error: { code: string } }).error.code,
      "PROJECT_NAME_TAKEN",
    );

    const otherProject = await jsonRequest("POST", { name: "Another name" }, firstCookie);
    assert.equal(otherProject.status, 201);
    const firstAccountSecondProject = (await otherProject.json() as { data: Project }).data;
    const renameConflict = await request(
      `/api/v1/projects/${firstAccountSecondProject.id}`,
      {
        method: "PATCH",
        headers: { cookie: firstCookie, "content-type": "application/json" },
        body: JSON.stringify({ name: "Shared name" }),
      },
    );
    assert.equal(renameConflict.status, 409);

    const secondAccount = await register("second@example.test");
    assert.equal(secondAccount.response.status, 201);
    const secondCookie = secondAccount.cookie!;
    const otherAccountSameName = await jsonRequest(
      "POST",
      { name: "Shared name" },
      secondCookie,
    );
    assert.equal(otherAccountSameName.status, 201);
    const secondProject = (await otherAccountSameName.json() as { data: Project }).data;
    assert.notEqual(secondProject.id, firstProject.id);

    const firstList = await request("/api/v1/projects", {
      headers: { cookie: firstCookie },
    });
    assert.deepEqual(
      (await firstList.json() as { data: Project[] }).data.map((project) => project.id).sort(),
      [firstProject.id, firstAccountSecondProject.id].sort(),
    );

    const secondList = await request("/api/v1/projects", {
      headers: { cookie: secondCookie },
    });
    assert.deepEqual(
      (await secondList.json() as { data: Project[] }).data.map((project) => project.id),
      [secondProject.id],
    );

    const crossAccountRead = await request(`/api/v1/projects/${firstProject.id}`, {
      headers: { cookie: secondCookie },
    });
    assert.equal(crossAccountRead.status, 404);

    const crossAccountDelete = await request(`/api/v1/projects/${firstProject.id}`, {
      method: "DELETE",
      headers: { cookie: secondCookie },
    });
    assert.equal(crossAccountDelete.status, 404);

    const updated = await request(`/api/v1/projects/${firstProject.id}`, {
      method: "PATCH",
      headers: { cookie: firstCookie, "content-type": "application/json" },
      body: JSON.stringify({ description: "updated description" }),
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json() as { data: Project }).data.description, "updated description");

    const emptyUpdate = await request(`/api/v1/projects/${firstProject.id}`, {
      method: "PATCH",
      headers: { cookie: firstCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(emptyUpdate.status, 400);

    const invalidId = await request("/api/v1/projects/not-a-uuid", {
      headers: { cookie: firstCookie },
    });
    assert.equal(invalidId.status, 400);

    const deleted = await request(`/api/v1/projects/${firstProject.id}`, {
      method: "DELETE",
      headers: { cookie: firstCookie },
    });
    assert.equal(deleted.status, 200);

    const afterDelete = await request(`/api/v1/projects/${firstProject.id}`, {
      headers: { cookie: firstCookie },
    });
    assert.equal(afterDelete.status, 404);

    const login = await request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "FIRST@example.test", password: "a-long-test-password" }),
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie") ?? "", /devmate_auth=/);

    const invalidLogin = await request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "first@example.test", password: "incorrect-password" }),
    });
    assert.equal(invalidLogin.status, 401);
  });

  it("sends a password reset link and updates the password with a valid token", async () => {
    const account = await register("reset@example.test");
    assert.equal(account.response.status, 201);

    const unknownEmail = await request("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "missing@example.test" }),
    });
    assert.equal(unknownEmail.status, 200);
    assert.equal(mailCalls.length, 0);

    const forgotPassword = await request("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "RESET@example.test" }),
    });
    assert.equal(forgotPassword.status, 200);
    assert.equal(mailCalls.length, 1);
    assert.equal(mailCalls[0]?.email, "reset@example.test");

    const token = mailCalls[0]?.resetUrl.split("/reset-password/")[1];
    assert.ok(token);

    const invalidToken = await request("/api/v1/auth/reset-password/not-a-valid-reset-token");
    assert.equal(invalidToken.status, 400);

    const validToken = await request(`/api/v1/auth/reset-password/${token}`);
    assert.equal(validToken.status, 200);

    const mismatchedPasswords = await request(`/api/v1/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        password: "a-brand-new-password",
        confirmPassword: "a-different-password",
      }),
    });
    assert.equal(mismatchedPasswords.status, 400);

    const reset = await request(`/api/v1/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        password: "a-brand-new-password",
        confirmPassword: "a-brand-new-password",
      }),
    });
    assert.equal(reset.status, 200);
    assert.match(reset.headers.get("set-cookie") ?? "", /devmate_auth=/);
    assert.doesNotMatch(JSON.stringify(await reset.json()), /passwordHash/);

    const reusedToken = await request(`/api/v1/auth/reset-password/${token}`);
    assert.equal(reusedToken.status, 401);

    const oldPasswordLogin = await request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "reset@example.test", password: "a-long-test-password" }),
    });
    assert.equal(oldPasswordLogin.status, 401);

    const newPasswordLogin = await request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "reset@example.test", password: "a-brand-new-password" }),
    });
    assert.equal(newPasswordLogin.status, 200);
  });

  it("rejects invalid input, unsafe origins, malformed JSON, and unknown routes", async () => {
    const invalidRegistration = await request("/api/v1/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", email: "bad", password: "short" }),
    });
    assert.equal(invalidRegistration.status, 400);
    assert.equal(
      (await invalidRegistration.json() as { error: { code: string } }).error.code,
      "VALIDATION_ERROR",
    );

    const unsafeOrigin = await request("/api/v1/auth/register", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "origin@example.test",
        password: "a-long-test-password",
      }),
    });
    assert.equal(unsafeOrigin.status, 403);

    const account = await register("invalid-input@example.test");
    assert.equal(account.response.status, 201);
    const invalidProject = await jsonRequest("POST", { name: " " }, account.cookie);
    assert.equal(invalidProject.status, 400);

    const allowedOrigin = new URL(process.env.FRONTEND_URL!).origin;
    const preflight = await request("/api/v1/projects", {
      method: "OPTIONS",
      headers: {
        origin: allowedOrigin,
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type",
      },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), allowedOrigin);

    const malformedJson = await request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    assert.equal(malformedJson.status, 400);
    assert.equal(
      (await malformedJson.json() as { error: { code: string } }).error.code,
      "INVALID_JSON",
    );

    const unknownRoute = await request("/api/v1/missing");
    assert.equal(unknownRoute.status, 404);
    assert.equal((await unknownRoute.json() as { error: { code: string } }).error.code, "NOT_FOUND");
  });
});
