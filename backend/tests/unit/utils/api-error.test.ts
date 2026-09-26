import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../../../src/utils/api-error.ts";
import { getValidationMessage } from "../../../src/utils/validation.ts";
import { z } from "zod";

describe("API error utilities", () => {
  it("retains the HTTP status, error code, and message", () => {
    const error = new ApiError(409, "CONFLICT", "Already exists");
    assert.ok(error instanceof Error);
    assert.deepEqual({
      name: "ApiError",
      statusCode: 409,
      code: "CONFLICT",
      message: "Already exists",
    }, {
      name: error.name,
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    });
  });

  it("returns the first validation issue", () => {
    const result = z.string().min(2).safeParse("");
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(getValidationMessage(result.error), /Too small/);
    }
  });
});
