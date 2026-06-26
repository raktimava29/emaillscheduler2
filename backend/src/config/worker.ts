import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { db } from "./db";
import { emailQueue } from "./queue";
import { sendEmail } from "../services/gmail-service";

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
          b.sender_email,
          b.subject,
          b.body,
          b.hourly_limit,
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
        sender_email,
        subject,
        body,
        hourly_limit,
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
            delay: nextRun.getTime() - Date.now(),
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

      console.log(
        `Processing email ${emailJob.id} -> ${emailJob.recipient_email}`
      );

      try {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await sendEmail({
              from: sender_email,
              to: emailJob.recipient_email,
              subject,
              text: body,
              refreshToken: gmail_refresh_token,
            });

            break;
          } catch (err) {
            console.error(
              `Attempt ${attempt} failed for job ${emailJob.id}:`,
              err
            );

            if (attempt === 3) {
              throw err;
            }

            await new Promise((resolve) =>
              setTimeout(resolve, 2000)
            );
          }
        }

        await db.query(
          `
          UPDATE email_jobs
          SET status = 'sent',
              sent_at = NOW()
          WHERE id = $1
          `,
          [emailJob.id]
        );

        console.log(`Email ${emailJob.id} sent successfully`);
      } catch (err) {
        console.error(`Email ${emailJob.id} failed:`, err);

        await db.query(
          `
          UPDATE email_jobs
          SET status = 'failed',
              error_message = $2
          WHERE id = $1
          `,
          [
            emailJob.id,
            err instanceof Error ? err.message : "Unknown error",
          ]
        );

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
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  console.log("BullMQ worker started");
}