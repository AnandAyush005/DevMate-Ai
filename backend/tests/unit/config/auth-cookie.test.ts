import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.JWT_SECRET ??= "test-only-jwt-secret-with-at-least-32-bytes";
process.env.FRONTEND_URL ??= "http://localhost:3000";

const { authConfig } = await import("../../../src/config/auth.ts");
const { readAuthCookie } = await import("../../../src/config/auth-cookie.ts");

describe("auth cookie parsing", () => {
  it("reads the configured cookie without being confused by other cookies", () => {
    assert.equal(
      readAuthCookie(`other=value; ${authConfig.cookieName}=token.value; next=1`),
      "token.value",
    );
    assert.equal(readAuthCookie(`${authConfig.cookieName}=`), null);
    assert.equal(readAuthCookie("other=value"), null);
    assert.equal(readAuthCookie(undefined), null);
  });
});
