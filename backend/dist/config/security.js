"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCookieOptions = exports.authCookieName = exports.allowedOrigins = void 0;
exports.requireTrustedOrigin = requireTrustedOrigin;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fallbackOrigins = [
    "http://localhost:5173",
    "https://emaillscheduler2.vercel.app",
];
exports.allowedOrigins = Array.from(new Set([process.env.FRONTEND_URL, ...fallbackOrigins].filter(Boolean)));
exports.authCookieName = "chronomail_session";
const frontendUrl = process.env.FRONTEND_URL || fallbackOrigins[0];
const isLocalFrontend = frontendUrl.startsWith("http://localhost") ||
    frontendUrl.startsWith("http://127.0.0.1");
const useSecureCookies = process.env.NODE_ENV === "production" || frontendUrl.startsWith("https://");
exports.authCookieOptions = {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: useSecureCookies && !isLocalFrontend ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 1000,
};
function requireTrustedOrigin(req, res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }
    const origin = req.headers.origin;
    if (origin && !exports.allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: "Untrusted request origin" });
    }
    next();
}
