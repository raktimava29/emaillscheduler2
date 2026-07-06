"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const queue_1 = require("./queue");
const gmail_service_1 = require("../services/gmail-service");
dotenv_1.default.config();
function getHourKey(senderEmail, date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    return `email_rate:${senderEmail}:${yyyy}-${mm}-${dd}-${hh}`;
}
function startOfNextHour(date) {
    const d = new Date(date);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
}
function startWorker() {
    const redis = new ioredis_1.default(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });
    const worker = new bullmq_1.Worker("email-queue", async (job) => {
        const { emailJobId } = job.data;
        const { rows: jobRows } = await db_1.db.query("SELECT * FROM email_jobs WHERE id = $1", [emailJobId]);
        if (jobRows.length === 0)
            return;
        const emailJob = jobRows[0];
        if (emailJob.status !== "scheduled")
            return;
        const { rows: batchRows } = await db_1.db.query(`
        SELECT
          b.user_id,
          b.sender_email,
          b.subject,
          b.body,
          b.hourly_limit,
          u.gmail_refresh_token
        FROM email_batches b
        JOIN users u
          ON b.user_id = u.id
        WHERE b.id = $1
        `, [emailJob.batch_id]);
        if (batchRows.length === 0)
            return;

        const { user_id, sender_email, subject, body, hourly_limit, gmail_refresh_token, } = batchRows[0];

        if (!gmail_refresh_token) {
            throw new Error("User has not connected Gmail.");
        }
        const now = new Date();
        const hourKey = getHourKey(sender_email, now);
        const currentCount = await redis.incr(hourKey);
        if (currentCount === 1) {
            await redis.expire(hourKey, 3600);
        }
        if (currentCount > hourly_limit) {
            const nextRun = startOfNextHour(now);
            await db_1.db.query("UPDATE email_jobs SET scheduled_at = $1 WHERE id = $2", [nextRun, emailJob.id]);
            await queue_1.emailQueue.add("send-email", { emailJobId: emailJob.id }, {
                delay: Math.max(nextRun.getTime() - Date.now(), 0),
            });
            return;
        }
        const lock = await db_1.db.query(`
        UPDATE email_jobs
        SET status = 'processing'
        WHERE id = $1
          AND status = 'scheduled'
        `, [emailJob.id]);
        if (lock.rowCount === 0)
            return;
        try {
            await (0, gmail_service_1.sendEmail)({
                from: sender_email,
                to: emailJob.recipient_email,
                subject,
                text: body,
                refreshToken: gmail_refresh_token,
            });
            await db_1.db.query(`
          UPDATE email_jobs
          SET status = 'sent',
              sent_at = NOW()
          WHERE id = $1
          `, [emailJob.id]);
        }
        catch (err) {
            if (err instanceof Error &&
                err.code === "GMAIL_TOKEN_INVALID") {
                console.log(`Invalid Gmail refresh token for ${sender_email}. Clearing token...`);
                const result = await db_1.db.query(`
  UPDATE users
  SET gmail_refresh_token = NULL
  WHERE id = $1
  RETURNING id, email;
  `, [user_id]);
                console.log("Rows updated:", result.rowCount);
                console.log(result.rows);
            }
            console.error(`Email ${emailJob.id} attempt failed`);
            // Only mark permanently failed after BullMQ has exhausted retries.
            if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
                await db_1.db.query(`
            UPDATE email_jobs
            SET status = 'failed',
                error_message = $2
            WHERE id = $1
            `, [
                    emailJob.id,
                    err.code === "GMAIL_TOKEN_INVALID"
                        ? "Reconnect Gmail"
                        : err instanceof Error
                            ? err.message
                            : "Unknown error",
                ]);
                console.error(`Email ${emailJob.id} permanently failed`);
            }
            throw err;
        }
    }, {
        connection: redis,
        concurrency: 5,
    });
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });
    worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed: ${err.message}`);
    });
    worker.on("error", (err) => {
        console.error("Worker error:", err);
    });
    console.log("BullMQ worker started");
}
