import type { Request, Response } from "express";
import app from "../src/app.ts";

export default function handler(req: Request, res: Response) {
  const originalPath = req.headers["x-matched-path"] as string | undefined;
  if (originalPath && (req.url.startsWith("/api") || req.url === "/")) {
    const queryIndex = req.url.indexOf("?");
    const query = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = `${originalPath}${query}`;
  }

  return app(req, res);
}

export { app };
