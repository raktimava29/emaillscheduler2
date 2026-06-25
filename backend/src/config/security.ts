import { CookieOptions, NextFunction, Request, Response } from "express";
import { SignOptions } from "jsonwebtoken";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const frontendUrl = requireEnv("FRONTEND_URL");

export const jwtSecret = requireEnv("JWT_SECRET");

export const jwtExpiresIn = requireEnv("JWT_EXPIRES_IN") as SignOptions["expiresIn"];

const jwtCookieMaxAge = Number(requireEnv("JWT_COOKIE_MAX_AGE"));

if (!Number.isFinite(jwtCookieMaxAge) || jwtCookieMaxAge <= 0) {
  throw new Error("JWT_COOKIE_MAX_AGE must be a positive number.");
}

export const authCookieName = "chronomail_session";

const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: jwtCookieMaxAge,
};

export const allowedOrigins = [frontendUrl];

export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction) {

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (!origin) {
    return next();
  }

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: "Untrusted request origin",
    });
  }

  next();
}