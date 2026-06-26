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
      console.log("========================================");
      console.log("Worker received job:", job.id);
      console.log("Job data:", job.data);
      console.log("========================================");

      const { emailJobId } = job.data;

      console.log("1. Fetching email job...");

      const { rows: jobRows } = await db.query(
        "SELECT * FROM email_jobs WHERE id = $1",
        [emailJobId]
      );

      console.log("Job rows:", jobRows.length);

      if (jobRows.length === 0) return;

      const emailJob = jobRows[0];

      console.log("2. Job status:", emailJob.status);

      if (emailJob.status !== "scheduled") return;

      console.log("3. Fetching batch...");

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

      console.log("Batch rows:", batchRows.length);

      if (batchRows.length === 0) return;

      const {
        sender_email,
        subject,
        body,
        hourly_limit,
        gmail_refresh_token,
      } = batchRows[0];

      console.log("4. Sender:", sender_email);
      console.log("5. Subject:", subject);
      console.log("6. Has refresh token:", !!gmail_refresh_token);

      if (!gmail_refresh_token) {
        throw new Error("User has not connected Gmail.");
      }

      const now = new Date();
      const hourKey = getHourKey(sender_email, now);

      console.log("7. Checking rate limit...");

      const currentCount = await redis.incr(hourKey);

      console.log("Current count:", currentCount);

      if (currentCount === 1) {
        await redis.expire(hourKey, 3600);
      }

      if (currentCount > hourly_limit) {
        console.log("Hourly limit exceeded.");

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

      console.log("8. Locking job...");

      const lock = await db.query(
        `
        UPDATE email_jobs
        SET status = 'processing'
        WHERE id = $1
          AND status = 'scheduled'
        `,
        [emailJob.id]
      );

      console.log("Lock rowCount:", lock.rowCount);

      if (lock.rowCount === 0) return;

      try {
        console.log("9. Starting send loop");

        for (let i = 1; i <= 3; i++) {
          try {
            console.log(`Attempt ${i}`);

            console.log("Calling sendEmail()...");

            await sendEmail({
              from: sender_email,
              to: emailJob.recipient_email,
              subject,
              text: body,
              refreshToken: gmail_refresh_token,
            });

            console.log("sendEmail() returned successfully");

            break;
          } catch (err) {
            console.error(`Attempt ${i} failed`);
            console.error(err);

            if (i === 3) {
              throw err;
            }

            await new Promise((resolve) =>
              setTimeout(resolve, 2000)
            );
          }
        }

        console.log("10. Updating DB to SENT...");

        await db.query(
          `
          UPDATE email_jobs
          SET status = 'sent',
              sent_at = NOW()
          WHERE id = $1
          `,
          [emailJob.id]
        );

        console.log("11. Email marked as SENT");
      } catch (err) {
        console.error("Worker catch block");
        console.error(err);

        await db.query(
          `
          UPDATE email_jobs
          SET status='failed',
              error_message=$2
          WHERE id=$1
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
    console.log("Job completed:", job.id);
  });

  worker.on("failed", (job, err) => {
    console.error("Job failed:", job?.id);
    console.error(err);
  });

  worker.on("error", (err) => {
    console.error("Worker error:");
    console.error(err);
  });

  console.log("Worker started");
}