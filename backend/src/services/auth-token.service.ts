import { createHmac, timingSafeEqual } from "node:crypto";
import { authConfig } from "../config/auth.js";

const encodeJson = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (input: string) =>
  createHmac("sha256", authConfig.jwtSecret).update(input).digest();

const decodeJson = (part: string): unknown => {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const createAuthToken = (userId: string) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    sub: userId,
    iat: issuedAt,
    exp: issuedAt + authConfig.tokenLifetimeSeconds,
  });
  const input = `${header}.${payload}`;
  return `${input}.${sign(input).toString("base64url")}`;
};

export const verifyAuthToken = (token: string): string | null => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const header = decodeJson(encodedHeader);
  const payload = decodeJson(encodedPayload);
  if (!isRecord(header) || !isRecord(payload)) {
    return null;
  }

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload.sub !== "string" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number" ||
    payload.iat > now + 60 ||
    payload.exp <= now ||
    payload.exp > payload.iat + authConfig.tokenLifetimeSeconds
  ) {
    return null;
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
  const actualSignature = Buffer.from(encodedSignature, "base64url");
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  return payload.sub;
};
