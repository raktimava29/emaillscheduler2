"use strict";
exports.__esModule = true;
var express_1 = require("express");
var passport_1 = require("../config/passport");
require("../config/passport-gmail");
var auth_1 = require("../middleware/auth");
var router = express_1.Router();
router.get("/connect", auth_1.requireAuth, passport_1["default"].authenticate("google-gmail", {
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.send",
    ],
    accessType: "offline",
    prompt: "consent"
}));
router.get("/callback", passport_1["default"].authenticate("google-gmail", {
    session: false,
    failureRedirect: "/"
}), function (_req, res) {
    res.send("✅ Gmail connected successfully");
});
exports["default"] = router;
