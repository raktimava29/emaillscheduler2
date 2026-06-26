"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sendTestMail = exports.gmailCallback = exports.connectGmail = void 0;
var googleapis_1 = require("googleapis");
var gmail_1 = require("../config/gmail");
var db_1 = require("../config/db");
var gmail_service_1 = require("../services/gmail-service");
var SCOPES = [
    "openid",
    "email",
    "profile",
    "https://mail.google.com/",
];
function connectGmail(req, res) {
    var url = gmail_1.oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES
    });
    res.redirect(url);
}
exports.connectGmail = connectGmail;
function gmailCallback(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var code, currentUser, tokens, oauth2, user, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    code = req.query.code;
                    if (!code) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Missing authorization code"
                            })];
                    }
                    currentUser = req.user;
                    return [4 /*yield*/, gmail_1.oauth2Client.getToken(code)];
                case 1:
                    tokens = (_a.sent()).tokens;
                    gmail_1.oauth2Client.setCredentials(tokens);
                    oauth2 = googleapis_1.google.oauth2({
                        auth: gmail_1.oauth2Client,
                        version: "v2"
                    });
                    return [4 /*yield*/, oauth2.userinfo.get()];
                case 2:
                    user = _a.sent();
                    if (currentUser.email !== user.data.email) {
                        return [2 /*return*/, res.status(400).json({
                                error: "The selected Gmail account does not match your logged-in account."
                            })];
                    }
                    if (!tokens.refresh_token) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.db.query("\n      UPDATE users\n      SET gmail_refresh_token = $1\n      WHERE id = $2\n      ", [
                            tokens.refresh_token,
                            currentUser.userId,
                        ])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, res.redirect(process.env.FRONTEND_URL + "/compose?gmail=connected")];
                case 5:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [2 /*return*/, res.status(500).json({
                            error: "Failed to connect Gmail"
                        })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.gmailCallback = gmailCallback;
function sendTestMail(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var currentUser, rows, _a, email, gmail_refresh_token, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    currentUser = req.user;
                    return [4 /*yield*/, db_1.db.query("\n      SELECT\n        email,\n        gmail_refresh_token\n      FROM users\n      WHERE id = $1\n      ", [currentUser.userId])];
                case 1:
                    rows = (_b.sent()).rows;
                    if (rows.length === 0) {
                        return [2 /*return*/, res.status(404).json({
                                error: "User not found."
                            })];
                    }
                    _a = rows[0], email = _a.email, gmail_refresh_token = _a.gmail_refresh_token;
                    if (!gmail_refresh_token) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Connect Gmail first."
                            })];
                    }
                    return [4 /*yield*/, gmail_service_1.sendEmail({
                            from: email,
                            to: email,
                            subject: "ChronoMail Gmail API Test",
                            text: "🎉 Gmail API is working!",
                            refreshToken: gmail_refresh_token
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.json({
                            success: true,
                            message: "Test email sent."
                        })];
                case 3:
                    err_2 = _b.sent();
                    console.error(err_2);
                    return [2 /*return*/, res.status(500).json({
                            error: "Failed to send email"
                        })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.sendTestMail = sendTestMail;
