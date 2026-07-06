"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_router_1 = __importDefault(require("./routers/email-router"));
const db_1 = require("./config/db");
const passport_1 = __importDefault(require("./config/passport"));
const login_router_1 = __importDefault(require("./routers/login-router"));
const worker_1 = require("./config/worker");
const security_1 = require("./config/security");
const gmail_router_1 = __importDefault(require("./routers/gmail-router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: security_1.allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(security_1.requireTrustedOrigin);
app.use(passport_1.default.initialize());
app.use("/gmail", gmail_router_1.default);
app.get("/", async (_req, res) => {
    const { rows } = await db_1.db.query("SELECT 'API running' AS msg");
    res.json(rows);
});
app.use("/emails", email_router_1.default);
app.use("/auth", login_router_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    (0, worker_1.startWorker)();
});
