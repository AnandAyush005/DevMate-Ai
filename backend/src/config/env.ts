
const jwtSecret = process.env["JWT_SECRET"];

if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error("JWT_SECRET must contain at least 32 bytes.");
}

const frontendUrl = process.env["FRONTEND_URL"];

if (!frontendUrl) {
  throw new Error("FRONTEND_URL must be configured.");
}

const parsedFrontendUrl = new URL(frontendUrl);

if (
  parsedFrontendUrl.protocol !== "http:" &&
  parsedFrontendUrl.protocol !== "https:"
) {
  throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
}

const frontendOrigin = parsedFrontendUrl.origin;

const smtpPort = Number.parseInt(
  process.env["SMTP_PORT"] ?? "587",
  10,
);

if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
  throw new Error("SMTP_PORT must be a positive integer.");
}

// Cookie configuration
const cookieSameSite = (
  process.env["COOKIE_SAME_SITE"] ?? "lax"
).toLowerCase();

const isCookieSameSite = (
  value: string,
): value is "strict" | "lax" | "none" =>
  value === "strict" || value === "lax" || value === "none";

if (!isCookieSameSite(cookieSameSite)) {
  throw new Error(
    "COOKIE_SAME_SITE must be strict, lax, or none.",
  );
}

const isProduction = process.env["NODE_ENV"] === "production";

const cookieSecure = isProduction || cookieSameSite === "none";

if (isProduction && cookieSameSite === "none" && !cookieSecure) {
  throw new Error("SameSite=None cookies require Secure=true.");
}

export const env = {
  frontendOrigin,
  jwtSecret,

  cookie: {
    sameSite: cookieSameSite,
    secure: cookieSecure,
    httpOnly: true,
    path: "/",
  },

  smtp: {
    host: process.env["SMTP_HOST"] ?? "",
    port: smtpPort,
    secure:
      (process.env["SMTP_SECURE"] ?? "false").toLowerCase() === "true",
    user: process.env["SMTP_USER"] ?? "",
    pass: process.env["SMTP_PASS"] ?? "",
    from:
      process.env["SMTP_FROM"] ??
      process.env["SMTP_USER"] ??
      "DevMate <noreply@localhost>",
  },
};
