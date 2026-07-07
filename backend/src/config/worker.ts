import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { db } from "./db";
import { emailQueue } from "./queue";
import { sendEmail } from "../services/gmail-service";
import { downloadResume } from "../services/storage-service";

dotenv.config();

function getHourKey(senderEmail: string, date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");

  return `email_rate:${senderEmail}:${yyyy}-${mm}-${dd}-${hh}`;
}

function startOfNextHour(date: Date) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function startWorker() {
  const redis = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    "email-queue",
    async (job) => {

      const { emailJobId } = job.data;

      const { rows: jobRows } = await db.query(
        "SELECT * FROM email_jobs WHERE id = $1",
        [emailJobId]
      );

      if (jobRows.length === 0) return;

      const emailJob = jobRows[0];

      if (emailJob.status !== "scheduled") return;

      const { rows: batchRows } = await db.query(
        `
        SELECT
          b.user_id,
          b.sender_email,
          b.subject,
          b.body,
          b.hourly_limit,
          b.resume_path,
          b.resume_filename,
          u.gmail_refresh_token
        FROM email_batches b
        JOIN users u
          ON b.user_id = u.id
        WHERE b.id = $1
        `,
        [emailJob.batch_id]
      );

      if (batchRows.length === 0) return;

      const {
        user_id,
        sender_email,
        subject,
        body,
        hourly_limit,
        resume_path,
        resume_filename,
        gmail_refresh_token,
      } = batchRows[0];

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

        await db.query(
          "UPDATE email_jobs SET scheduled_at = $1 WHERE id = $2",
          [nextRun, emailJob.id]
        );

        await emailQueue.add(
          "send-email",
          { emailJobId: emailJob.id },
          {
            delay: Math.max(nextRun.getTime() - Date.now(), 0),
          }
        );

        return;
      }

      const lock = await db.query(
        `
        UPDATE email_jobs
        SET status = 'processing'
        WHERE id = $1
          AND status = 'scheduled'
        `,
        [emailJob.id]
      );

      if (lock.rowCount === 0) return;

      try {
        console.log(`Sending email ${emailJob.id}...`);
        let attachment:
            | {
                  filename: string;
                  content: Buffer;
              }
            | undefined;

        if (resume_path) {
            console.log(`Downloading resume: ${resume_path}`);
            
            attachment = {
                filename: resume_filename,
                content: await downloadResume(resume_path),
            };

            console.log("Resume downloaded successfully.");
        }

        await sendEmail({
          from: sender_email,
          to: emailJob.recipient_email,
          subject,
          text: body,
          refreshToken: gmail_refresh_token,
          attachment
        });
        console.log(`Email ${emailJob.id} sent via Gmail API`);

        console.log(`Marking ${emailJob.id} as sent...`);
        await db.query(
          `
          UPDATE email_jobs
          SET status = 'sent',
              sent_at = NOW()
          WHERE id = $1
          `,
          [emailJob.id]
        );

        console.log(`Marked ${emailJob.id} as sent`);

      } catch (err) {
          console.error("Worker caught error:");
          console.error(err);
          if (
            err instanceof Error &&
            (err as any).code === "GMAIL_TOKEN_INVALID"
          ) {
            console.log(`Invalid Gmail refresh token for ${sender_email}. Clearing token...`);

            await db.query(
              `
              UPDATE users
              SET gmail_refresh_token = NULL
              WHERE id = $1
              RETURNING id, email;
              `,
              [user_id]
            );
        }
        console.error(`Email ${emailJob.id} attempt failed`);

        // Only mark permanently failed after BullMQ has exhausted retries.
        if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
          await db.query(
            `
            UPDATE email_jobs
            SET status = 'failed',
                error_message = $2
            WHERE id = $1
            `,
            [
              emailJob.id,
              (err as any).code === "GMAIL_TOKEN_INVALID"
                ? "Reconnect Gmail"
                : err instanceof Error
                ? err.message
                : "Unknown error",
            ]
          );

          console.error(`Email ${emailJob.id} permanently failed`);
        }

        throw err;
      }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

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