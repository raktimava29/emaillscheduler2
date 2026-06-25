"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const login_controller_1 = require("../controllers/login-controller");
const auth_1 = require("../middleware/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: frontend,
}), login_controller_1.googleCallbackController);
router.get("/me", auth_1.requireAuth, login_controller_1.getMe);
router.post("/login", login_controller_1.login);
router.post("/logout", login_controller_1.logout);
router.post("/register", login_controller_1.register);
exports.default = router;
