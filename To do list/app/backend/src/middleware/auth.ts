import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthedRequest extends Request {
  userId?: string;
}

/** Verifies the user's session JWT (issued at login) for all /api/* routes. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Verifies a static shared-secret header for machine-to-machine calls
 * (Scheduler Service -> /internal/*, AI Module -> /internal/*). These callers
 * have no user session, so they authenticate with INTERNAL_API_KEY instead.
 */
export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-internal-key"];
  if (key !== env.internalApiKey) {
    return res.status(401).json({ error: "Invalid internal API key" });
  }
  next();
}
