"use strict";
exports.__esModule = true;
exports.requireAuth = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var security_1 = require("../config/security");
function getCookie(req, name) {
    var cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return null;
    var cookies = cookieHeader.split(";").map(function (cookie) { return cookie.trim(); });
    for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
        var cookie = cookies_1[_i];
        var separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1)
            continue;
        var key = cookie.slice(0, separatorIndex);
        var value = cookie.slice(separatorIndex + 1);
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}
function requireAuth(req, res, next) {
    var token = getCookie(req, security_1.authCookieName);
    if (!token) {
        return res.status(401).json({ error: "Missing session" });
    }
    try {
        var decoded = jsonwebtoken_1["default"].verify(token, security_1.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (_a) {
        return res.status(401).json({ error: "Invalid session" });
    }
}
exports.requireAuth = requireAuth;
