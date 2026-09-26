import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isUniqueConstraintViolation } from "../../../src/services/database-error.service.ts";

describe("database error mapping", () => {
  it("finds PostgreSQL unique violations wrapped in causes", () => {
    const nested = Object.assign(new Error("unique violation"), { code: "23505" });
    assert.equal(isUniqueConstraintViolation(new Error("query failed", { cause: nested })), true);
    assert.equal(isUniqueConstraintViolation({ code: "23503" }), false);
    assert.equal(isUniqueConstraintViolation(new Error("unknown")), false);
  });

  it("safely handles cyclic causes", () => {
    const error: { cause?: unknown } = {};
    error.cause = error;
    assert.equal(isUniqueConstraintViolation(error), false);
  });
});
