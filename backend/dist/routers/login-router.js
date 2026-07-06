"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const login_controller_1 = require("../controllers/login-controller");
const auth_1 = require("../middleware/auth");
const security_1 = require("../config/security");
const router = (0, express_1.Router)();
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
router.get("/google/callback", (req, res, next) => {
    const { iss, code } = req.query;
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
}, passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: security_1.frontendUrl,
}), login_controller_1.googleCallbackController);
router.get("/me", auth_1.requireAuth, login_controller_1.getMe);
router.post("/login", login_controller_1.login);
router.post("/logout", login_controller_1.logout);
router.post("/register", login_controller_1.register);
exports.default = router;
