import { env } from "./env.js";

export const authConfig = {
  jwtSecret: env.jwtSecret,
  tokenLifetimeSeconds: 60 * 60 * 24 * 7,
  passwordResetLifetimeSeconds: 60 * 60,
  cookieName: "devmate_auth",
};
