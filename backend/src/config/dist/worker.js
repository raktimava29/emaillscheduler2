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
exports.startWorker = void 0;
var bullmq_1 = require("bullmq");
var ioredis_1 = require("ioredis");
var dotenv_1 = require("dotenv");
var db_1 = require("./db");
var queue_1 = require("./queue");
var gmail_service_1 = require("../services/gmail-service");
var storage_service_1 = require("../services/storage-service");
dotenv_1["default"].config();
function getHourKey(senderEmail, date) {
    var yyyy = date.getFullYear();
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var dd = String(date.getDate()).padStart(2, "0");
    var hh = String(date.getHours()).padStart(2, "0");
    return "email_rate:" + senderEmail + ":" + yyyy + "-" + mm + "-" + dd + "-" + hh;
}
function startOfNextHour(date) {
    var d = new Date(date);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
}
function startWorker() {
    var _this = this;
    var redis = new ioredis_1["default"](process.env.REDIS_URL, {
        maxRetriesPerRequest: null
    });
    var worker = new bullmq_1.Worker("email-queue", function (job) { return __awaiter(_this, void 0, void 0, function () {
        var emailJobId, jobRows, emailJob, batchRows, _a, user_id, sender_email, subject, body, hourly_limit, resume_path, resume_filename, gmail_refresh_token, now, hourKey, currentCount, nextRun, lock, attachment, _b, err_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    emailJobId = job.data.emailJobId;
                    return [4 /*yield*/, db_1.db.query("SELECT * FROM email_jobs WHERE id = $1", [emailJobId])];
                case 1:
                    jobRows = (_d.sent()).rows;
                    if (jobRows.length === 0)
                        return [2 /*return*/];
                    emailJob = jobRows[0];
                    if (emailJob.status !== "scheduled")
                        return [2 /*return*/];
                    return [4 /*yield*/, db_1.db.query("\n        SELECT\n          b.user_id,\n          b.sender_email,\n          b.subject,\n          b.body,\n          b.hourly_limit,\n          b.resume_path,\n          b.resume_filename,\n          u.gmail_refresh_token\n        FROM email_batches b\n        JOIN users u\n          ON b.user_id = u.id\n        WHERE b.id = $1\n        ", [emailJob.batch_id])];
                case 2:
                    batchRows = (_d.sent()).rows;
                    if (batchRows.length === 0)
                        return [2 /*return*/];
                    _a = batchRows[0], user_id = _a.user_id, sender_email = _a.sender_email, subject = _a.subject, body = _a.body, hourly_limit = _a.hourly_limit, resume_path = _a.resume_path, resume_filename = _a.resume_filename, gmail_refresh_token = _a.gmail_refresh_token;
                    if (!gmail_refresh_token) {
                        throw new Error("User has not connected Gmail.");
                    }
                    now = new Date();
                    hourKey = getHourKey(sender_email, now);
                    return [4 /*yield*/, redis.incr(hourKey)];
                case 3:
                    currentCount = _d.sent();
                    if (!(currentCount === 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, redis.expire(hourKey, 3600)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    if (!(currentCount > hourly_limit)) return [3 /*break*/, 8];
                    nextRun = startOfNextHour(now);
                    return [4 /*yield*/, db_1.db.query("UPDATE email_jobs SET scheduled_at = $1 WHERE id = $2", [nextRun, emailJob.id])];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, queue_1.emailQueue.add("send-email", { emailJobId: emailJob.id }, {
                            delay: Math.max(nextRun.getTime() - Date.now(), 0)
                        })];
                case 7:
                    _d.sent();
                    return [2 /*return*/];
                case 8: return [4 /*yield*/, db_1.db.query("\n        UPDATE email_jobs\n        SET status = 'processing'\n        WHERE id = $1\n          AND status = 'scheduled'\n        ", [emailJob.id])];
                case 9:
                    lock = _d.sent();
                    if (lock.rowCount === 0)
                        return [2 /*return*/];
                    _d.label = 10;
                case 10:
                    _d.trys.push([10, 15, , 20]);
                    console.log("Sending email " + emailJob.id + "...");
                    attachment = void 0;
                    if (!resume_path) return [3 /*break*/, 12];
                    console.log("Downloading resume: " + resume_path);
                    _b = {
                        filename: resume_filename
                    };
                    return [4 /*yield*/, storage_service_1.downloadResume(resume_path)];
                case 11:
                    attachment = (_b.content = _d.sent(),
                        _b);
                    console.log("Resume downloaded successfully.");
                    _d.label = 12;
                case 12: return [4 /*yield*/, gmail_service_1.sendEmail({
                        from: sender_email,
                        to: emailJob.recipient_email,
                        subject: subject,
                        text: body,
                        refreshToken: gmail_refresh_token,
                        attachment: attachment
                    })];
                case 13:
                    _d.sent();
                    console.log("Email " + emailJob.id + " sent via Gmail API");
                    console.log("Marking " + emailJob.id + " as sent...");
                    return [4 /*yield*/, db_1.db.query("\n          UPDATE email_jobs\n          SET status = 'sent',\n              sent_at = NOW()\n          WHERE id = $1\n          ", [emailJob.id])];
                case 14:
                    _d.sent();
                    console.log("Marked " + emailJob.id + " as sent");
                    return [3 /*break*/, 20];
                case 15:
                    err_1 = _d.sent();
                    console.error("Worker caught error:");
                    console.error(err_1);
                    if (!(err_1 instanceof Error &&
                        err_1.code === "GMAIL_TOKEN_INVALID")) return [3 /*break*/, 17];
                    console.log("Invalid Gmail refresh token for " + sender_email + ". Clearing token...");
                    return [4 /*yield*/, db_1.db.query("\n              UPDATE users\n              SET gmail_refresh_token = NULL\n              WHERE id = $1\n              RETURNING id, email;\n              ", [user_id])];
                case 16:
                    _d.sent();
                    _d.label = 17;
                case 17:
                    console.error("Email " + emailJob.id + " attempt failed");
                    if (!(job.attemptsMade + 1 >= ((_c = job.opts.attempts) !== null && _c !== void 0 ? _c : 1))) return [3 /*break*/, 19];
                    return [4 /*yield*/, db_1.db.query("\n            UPDATE email_jobs\n            SET status = 'failed',\n                error_message = $2\n            WHERE id = $1\n            ", [
                            emailJob.id,
                            err_1.code === "GMAIL_TOKEN_INVALID"
                                ? "Reconnect Gmail"
                                : err_1 instanceof Error
                                    ? err_1.message
                                    : "Unknown error",
                        ])];
                case 18:
                    _d.sent();
                    console.error("Email " + emailJob.id + " permanently failed");
                    _d.label = 19;
                case 19: throw err_1;
                case 20: return [2 /*return*/];
            }
        });
    }); }, {
        connection: redis,
        concurrency: 5
    });
    worker.on("completed", function (job) {
        console.log("Job " + job.id + " completed");
    });
    worker.on("failed", function (job, err) {
        console.error("Job " + (job === null || job === void 0 ? void 0 : job.id) + " failed: " + err.message);
    });
    worker.on("error", function (err) {
        console.error("Worker error:", err);
    });
    console.log("BullMQ worker started");
}
exports.startWorker = startWorker;
