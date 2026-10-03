import type { Response } from "express";
import { authConfig } from "./auth.ts";
import { env } from "./env.ts";

export const setAuthCookie = (res: Response, token: string) => {

  if(token === ""){
    res.clearCookie(authConfig.cookieName, {
      path : "/"
    });
    return;
  }

  res.cookie(authConfig.cookieName, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/",
    maxAge: authConfig.tokenLifetimeSeconds * 1000,
  });
};

export const readAuthCookie = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return null;
  }

  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) {
      continue;
    }

    if (item.slice(0, separator).trim() === authConfig.cookieName) {
      const value = item.slice(separator + 1).trim();
      return value.length > 0 ? value : null;
    }
  }

  return null;
};
