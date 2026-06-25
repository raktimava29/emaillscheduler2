"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallbackController = void 0;
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const frontend = process.env.FRONTEND_URL;
const googleCallbackController = (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Authentication failed" });
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret missing" });
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        email: user.email,
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log(frontend);
    return res.redirect(`${frontend}/auth/callback?token=${token}`);
};
exports.googleCallbackController = googleCallbackController;
/**
 * REGISTER (Non-Gmail)
 */
async function register(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing fields" });
        }
        const { rows } = await db_1.db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const id = (0, crypto_1.randomUUID)();
        const name = email.split("@")[0];
        await db_1.db.query(`
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      `, [id, name, email, hashedPassword]);
        res.json({ message: "User registered" });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Registration failed" });
    }
}
/**
 * LOGIN (email + password)
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { rows } = await db_1.db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = rows[0];
        // Gmail Users
        if (!user.password) {
            return res.status(400).json({
                error: "Use Google login for this account",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
}
/**
 * GET /auth/me
 */
async function getMe(req, res) {
    const userId = req.user.userId;
    const { rows } = await db_1.db.query("SELECT id, name, email, avatar_url FROM users WHERE id = $1", [userId]);
    if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(rows[0]);
}
