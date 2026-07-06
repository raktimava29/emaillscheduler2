"use strict";
exports.__esModule = true;
var express_1 = require("express");
var passport_1 = require("../config/passport");
var login_controller_1 = require("../controllers/login-controller");
var auth_1 = require("../middleware/auth");
var security_1 = require("../config/security");
var router = express_1.Router();
router.get("/google", passport_1["default"].authenticate("google", {
    scope: ["profile", "email"]
}));
router.get("/google/callback", function (req, res, next) {
    var _a = req.query, iss = _a.iss, code = _a.code;
    if (!code) {
        console.warn("OAuth callback missing code:", req.query);
        return res.redirect(security_1.frontendUrl);
    }
    if (typeof iss === "string" &&
        iss !== "https://accounts.google.com") {
        console.warn("Ignoring invalid OAuth callback:", req.query);
        return res.redirect(security_1.frontendUrl);
    }
    next();
}, passport_1["default"].authenticate("google", {
    session: false,
    failureRedirect: security_1.frontendUrl
}), login_controller_1.googleCallbackController);
router.get("/me", auth_1.requireAuth, login_controller_1.getMe);
router.post("/login", login_controller_1.login);
router.post("/logout", login_controller_1.logout);
router.post("/register", login_controller_1.register);
exports["default"] = router;
