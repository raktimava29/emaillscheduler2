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
exports.getMe = exports.login = exports.register = exports.googleCallbackController = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var db_1 = require("../config/db");
var crypto_1 = require("crypto");
var dotenv_1 = require("dotenv");
dotenv_1["default"].config();
var frontend = process.env.FRONTEND_URL;
exports.googleCallbackController = function (req, res) {
    var user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret missing" });
    }
    var token = jsonwebtoken_1["default"].sign({
        userId: user.id,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log(frontend);
    return res.redirect(frontend + "/auth/callback?token=" + token);
};
/**
 * REGISTER (Non-Gmail)
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, rows, hashedPassword, id, name, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, email = _a.email, password = _a.password;
                    if (!email || !password) {
                        return [2 /*return*/, res.status(400).json({ error: "Missing fields" })];
                    }
                    return [4 /*yield*/, db_1.db.query("SELECT * FROM users WHERE email = $1", [email])];
                case 1:
                    rows = (_b.sent()).rows;
                    if (rows.length > 0) {
                        return [2 /*return*/, res.status(400).json({ error: "User already exists" })];
                    }
                    return [4 /*yield*/, bcryptjs_1["default"].hash(password, 10)];
                case 2:
                    hashedPassword = _b.sent();
                    id = crypto_1.randomUUID();
                    name = email.split("@")[0];
                    return [4 /*yield*/, db_1.db.query("\n      INSERT INTO users (id, name, email, password)\n      VALUES ($1, $2, $3, $4)\n      ", [id, name, email, hashedPassword])];
                case 3:
                    _b.sent();
                    res.json({ message: "User registered" });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    console.error("Register error:", err_1);
                    res.status(500).json({ error: "Registration failed" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.register = register;
/**
 * LOGIN (email + password)
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, rows, user, isMatch, token, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.body, email = _a.email, password = _a.password;
                    return [4 /*yield*/, db_1.db.query("SELECT * FROM users WHERE email = $1", [email])];
                case 1:
                    rows = (_b.sent()).rows;
                    if (rows.length === 0) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
                    }
                    user = rows[0];
                    // Gmail Users
                    if (!user.password) {
                        return [2 /*return*/, res.status(400).json({
                                error: "Use Google login for this account"
                            })];
                    }
                    return [4 /*yield*/, bcryptjs_1["default"].compare(password, user.password)];
                case 2:
                    isMatch = _b.sent();
                    if (!isMatch) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
                    }
                    token = jsonwebtoken_1["default"].sign({
                        userId: user.id,
                        email: user.email
                    }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    res.json({ token: token });
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    console.error("Login error:", err_2);
                    res.status(500).json({ error: "Login failed" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.login = login;
/**
 * GET /auth/me
 */
function getMe(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.user.userId;
                    return [4 /*yield*/, db_1.db.query("SELECT id, name, email, avatar_url FROM users WHERE id = $1", [userId])];
                case 1:
                    rows = (_a.sent()).rows;
                    if (rows.length === 0) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    res.json(rows[0]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getMe = getMe;
