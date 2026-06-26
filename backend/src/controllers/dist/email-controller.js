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
exports.getEmailById = exports.getSentEmails = exports.getScheduledEmails = exports.scheduleEmails = void 0;
var crypto_1 = require("crypto");
var db_1 = require("../config/db");
var queue_1 = require("../config/queue");
function scheduleEmails(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, subject, body, startTime, delayBetweenEmailsSeconds, recipients, _b, hourlyLimit, userId, batchId, userRows, senderEmail, i, jobId, scheduledAt, delayMs, bullJob, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    _a = req.body, subject = _a.subject, body = _a.body, startTime = _a.startTime, delayBetweenEmailsSeconds = _a.delayBetweenEmailsSeconds, recipients = _a.recipients, _b = _a.hourlyLimit, hourlyLimit = _b === void 0 ? 100 : _b;
                    if (!recipients || recipients.length === 0) {
                        return [2 /*return*/, res.status(400).json({ error: "No recipients provided" })];
                    }
                    userId = req.user.userId;
                    batchId = crypto_1.randomUUID();
                    return [4 /*yield*/, db_1.db.query("\n      SELECT \n        email,\n        gmail_refresh_token\n      FROM users\n      WHERE id = $1\n      ", [userId])];
                case 1:
                    userRows = (_c.sent()).rows;
                    if (userRows.length === 0 ||
                        !userRows[0].gmail_refresh_token) {
                        return [2 /*return*/, res.status(403).json({
                                code: "GMAIL_NOT_CONNECTED",
                                message: "Please connect your Gmail account first.",
                                connectUrl: "/gmail/connect"
                            })];
                    }
                    senderEmail = userRows[0].email;
                    return [4 /*yield*/, db_1.db.query("\n      INSERT INTO email_batches\n      (id, user_id, sender_email, subject, body, start_time,\n       delay_between_emails_seconds, hourly_limit, total_emails)\n      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)\n      ", [
                            batchId,
                            userId,
                            senderEmail,
                            subject,
                            body,
                            new Date(startTime),
                            delayBetweenEmailsSeconds,
                            hourlyLimit,
                            recipients.length,
                        ])];
                case 2:
                    _c.sent();
                    //Create jobs and schedule BullMQ
                    console.log("Client startTime:", startTime);
                    console.log("Server now:", new Date().toISOString());
                    i = 0;
                    _c.label = 3;
                case 3:
                    if (!(i < recipients.length)) return [3 /*break*/, 8];
                    jobId = crypto_1.randomUUID();
                    scheduledAt = new Date(new Date(startTime).getTime() +
                        i * delayBetweenEmailsSeconds * 1000);
                    return [4 /*yield*/, db_1.db.query("\n        INSERT INTO email_jobs\n        (id, batch_id, recipient_email, scheduled_at)\n        VALUES ($1,$2,$3,$4)\n        ", [jobId, batchId, recipients[i], scheduledAt])];
                case 4:
                    _c.sent();
                    delayMs = scheduledAt.getTime() - Date.now();
                    return [4 /*yield*/, queue_1.emailQueue.add("send-email", { emailJobId: jobId }, { delay: Math.max(delayMs, 0) })];
                case 5:
                    bullJob = _c.sent();
                    return [4 /*yield*/, db_1.db.query("UPDATE email_jobs SET bull_job_id = $1 WHERE id = $2", [bullJob.id, jobId])];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 3];
                case 8: return [2 /*return*/, res.json({
                        message: "Emails scheduled",
                        batchId: batchId,
                        total: recipients.length
                    })];
                case 9:
                    err_1 = _c.sent();
                    console.error("Schedule error:", err_1);
                    res.status(500).json({ error: "Failed to schedule emails" });
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.scheduleEmails = scheduleEmails;
function getScheduledEmails(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, rows, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.user.userId;
                    return [4 /*yield*/, db_1.db.query("\n      SELECT\n        ej.id,\n        ej.recipient_email,\n        ej.scheduled_at,\n        ej.status,\n        eb.subject\n      FROM email_jobs ej\n      JOIN email_batches eb ON ej.batch_id = eb.id\n      WHERE eb.user_id = $1\n        AND ej.status = 'scheduled'\n      ORDER BY ej.scheduled_at ASC\n      ", [userId])];
                case 1:
                    rows = (_a.sent()).rows;
                    res.json(rows);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error("Fetch scheduled error:", err_2);
                    res.status(500).json({ error: "Failed to fetch scheduled emails" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getScheduledEmails = getScheduledEmails;
function getSentEmails(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, rows, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.user.userId;
                    return [4 /*yield*/, db_1.db.query("\n      SELECT\n        ej.id,\n        ej.recipient_email,\n        ej.sent_at,\n        ej.status,\n        eb.subject\n      FROM email_jobs ej\n      JOIN email_batches eb ON ej.batch_id = eb.id\n      WHERE eb.user_id = $1\n        AND ej.status = 'sent'\n      ORDER BY ej.sent_at DESC\n      ", [userId])];
                case 1:
                    rows = (_a.sent()).rows;
                    res.json(rows);
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error("Fetch sent error:", err_3);
                    res.status(500).json({ error: "Failed to fetch sent emails" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getSentEmails = getSentEmails;
function getEmailById(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, id, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = req.user.userId;
                    id = req.params.id;
                    return [4 /*yield*/, db_1.db.query("\n    SELECT\n      ej.id,\n      ej.recipient_email,\n      ej.status,\n      ej.scheduled_at,\n      ej.sent_at,\n      eb.subject,\n      eb.body\n    FROM email_jobs ej\n    JOIN email_batches eb ON ej.batch_id = eb.id\n    WHERE ej.id = $1\n      AND eb.user_id = $2\n    ", [id, userId])];
                case 1:
                    rows = (_a.sent()).rows;
                    if (rows.length === 0) {
                        return [2 /*return*/, res.status(404).json({ error: "Email not found" })];
                    }
                    res.json(rows[0]);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getEmailById = getEmailById;
