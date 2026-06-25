"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_1 = require("../config/security");
function getCookie(req, name) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return null;
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    for (const cookie of cookies) {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1)
            continue;
        const key = cookie.slice(0, separatorIndex);
        const value = cookie.slice(separatorIndex + 1);
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}
function requireAuth(req, res, next) {
    const token = getCookie(req, security_1.authCookieName);
    if (!token) {
        return res.status(401).json({ error: "Missing session" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, security_1.jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid session" });
    }
}
