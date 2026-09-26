const jwtSecret = process.env["JWT_SECRET"];

if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error("JWT_SECRET must contain at least 32 bytes.");
}

const frontendUrl = process.env["FRONTEND_URL"];
if (!frontendUrl) {
  throw new Error("FRONTEND_URL must be configured.");
}

const parsedFrontendUrl = new URL(frontendUrl);
if (parsedFrontendUrl.protocol !== "http:" && parsedFrontendUrl.protocol !== "https:") {
  throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
}

const frontendOrigin = parsedFrontendUrl.origin;
const cookieSameSite = (process.env["COOKIE_SAME_SITE"] ?? "lax").toLowerCase();

const isCookieSameSite = (
  value: string,
): value is "strict" | "lax" | "none" =>
  value === "strict" || value === "lax" || value === "none";

if (!isCookieSameSite(cookieSameSite)) {
  throw new Error("COOKIE_SAME_SITE must be strict, lax, or none.");
}

export const env = {
  frontendOrigin,
  jwtSecret,
  cookieSameSite,
  cookieSecure: process.env["NODE_ENV"] === "production" || cookieSameSite === "none",
};
