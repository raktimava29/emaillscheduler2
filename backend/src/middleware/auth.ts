import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { authCookieName, jwtSecret } from "../config/security";

function getCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = cookie.slice(0, separatorIndex);
    const value = cookie.slice(separatorIndex + 1);

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getCookie(req, authCookieName);

  if (!token) {
    return res.status(401).json({ error: "Missing session" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}
