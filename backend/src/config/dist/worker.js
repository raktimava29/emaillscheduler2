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
        var emailJobId, jobRows, emailJob, batchRows, _a, sender_email, hourly_limit, gmail_refresh_token, now, hourKey, currentCount, nextRun, lock, i, err_1, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    emailJobId = job.data.emailJobId;
                    return [4 /*yield*/, db_1.db.query("SELECT * FROM email_jobs WHERE id = $1", [emailJobId])];
                case 1:
                    jobRows = (_b.sent()).rows;
                    if (jobRows.length === 0)
                        return [2 /*return*/];
                    emailJob = jobRows[0];
                    if (emailJob.status !== "scheduled")
                        return [2 /*return*/];
                    return [4 /*yield*/, db_1.db.query("\n        SELECT\n          b.sender_email,\n          b.hourly_limit,\n          u.gmail_refresh_token\n        FROM email_batches b\n        JOIN users u\n          ON b.user_id = u.id\n        WHERE b.id = $1\n        ", [emailJob.batch_id])];
                case 2:
                    batchRows = (_b.sent()).rows;
                    if (batchRows.length === 0)
                        return [2 /*return*/];
                    _a = batchRows[0], sender_email = _a.sender_email, hourly_limit = _a.hourly_limit, gmail_refresh_token = _a.gmail_refresh_token;
                    if (!gmail_refresh_token) {
                        throw new Error("User has not connected Gmail.");
                    }
                    now = new Date();
                    hourKey = getHourKey(sender_email, now);
                    return [4 /*yield*/, redis.incr(hourKey)];
                case 3:
                    currentCount = _b.sent();
                    if (!(currentCount === 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, redis.expire(hourKey, 3600)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    if (!(currentCount > hourly_limit)) return [3 /*break*/, 8];
                    nextRun = startOfNextHour(now);
                    return [4 /*yield*/, db_1.db.query("UPDATE email_jobs SET scheduled_at = $1 WHERE id = $2", [nextRun, emailJob.id])];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, queue_1.emailQueue.add("send-email", { emailJobId: emailJob.id }, {
                            delay: nextRun.getTime() - Date.now()
                        })];
                case 7:
                    _b.sent();
                    return [2 /*return*/];
                case 8: return [4 /*yield*/, db_1.db.query("\n        UPDATE email_jobs\n        SET status = 'processing'\n        WHERE id = $1\n          AND status = 'scheduled'\n        ", [emailJob.id])];
                case 9:
                    lock = _b.sent();
                    if (lock.rowCount === 0)
                        return [2 /*return*/];
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 19, , 21]);
                    i = 1;
                    _b.label = 11;
                case 11:
                    if (!(i <= 3)) return [3 /*break*/, 17];
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 14, , 16]);
                    return [4 /*yield*/, gmail_service_1.sendEmail({
                            from: sender_email,
                            to: emailJob.recipient_email,
                            subject: "Scheduled Email",
                            text: "Hello from Email Scheduler",
                            refreshToken: gmail_refresh_token
                        })];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 14:
                    err_1 = _b.sent();
                    console.log("Retry " + i);
                    if (i === 3) {
                        throw err_1;
                    }
                    return [4 /*yield*/, new Promise(function (resolve) {
                            return setTimeout(resolve, 2000);
                        })];
                case 15:
                    _b.sent();
                    return [3 /*break*/, 16];
                case 16:
                    i++;
                    return [3 /*break*/, 11];
                case 17: return [4 /*yield*/, db_1.db.query("\n          UPDATE email_jobs\n          SET status = 'sent',\n              sent_at = NOW()\n          WHERE id = $1\n          ", [emailJob.id])];
                case 18:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 19:
                    err_2 = _b.sent();
                    console.error("sendEmail failed:", err_2);
                    return [4 /*yield*/, db_1.db.query("\n          UPDATE email_jobs\n          SET status = 'failed',\n              error_message = $2\n          WHERE id = $1\n          ", [
                            emailJob.id,
                            err_2 instanceof Error ? err_2.message : "Unknown error",
                        ])];
                case 20:
                    _b.sent();
                    throw err_2;
                case 21: return [2 /*return*/];
            }
        });
    }); }, {
        connection: redis,
        concurrency: 5
    });
    worker.on("failed", function (job, err) {
        console.error("Job failed:", job === null || job === void 0 ? void 0 : job.id, err.message);
    });
    console.log("Worker started");
}
exports.startWorker = startWorker;
