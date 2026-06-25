"use strict";
exports.__esModule = true;
exports.requireTrustedOrigin = exports.allowedOrigins = exports.authCookieOptions = exports.authCookieName = exports.jwtExpiresIn = exports.jwtSecret = exports.frontendUrl = void 0;
function requireEnv(name) {
    var value = process.env[name];
    if (!value) {
        throw new Error("Missing required environment variable: " + name);
    }
    return value;
}
exports.frontendUrl = requireEnv("FRONTEND_URL");
exports.jwtSecret = requireEnv("JWT_SECRET");
exports.jwtExpiresIn = requireEnv("JWT_EXPIRES_IN");
var jwtCookieMaxAge = Number(requireEnv("JWT_COOKIE_MAX_AGE"));
if (!Number.isFinite(jwtCookieMaxAge) || jwtCookieMaxAge <= 0) {
    throw new Error("JWT_COOKIE_MAX_AGE must be a positive number.");
}
exports.authCookieName = "chronomail_session";
var isProduction = process.env.NODE_ENV === "production";
exports.authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: jwtCookieMaxAge
};
exports.allowedOrigins = [exports.frontendUrl];
function requireTrustedOrigin(req, res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }
    var origin = req.headers.origin;
    if (!origin) {
        return next();
    }
    if (!exports.allowedOrigins.includes(origin)) {
        return res.status(403).json({
            error: "Untrusted request origin"
        });
    }
    next();
}
exports.requireTrustedOrigin = requireTrustedOrigin;
