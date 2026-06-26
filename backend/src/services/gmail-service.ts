import { google } from "googleapis";
import { oauth2Client } from "../config/gmail";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text: string;
  refreshToken: string;
}

export async function sendEmail({
  from,
  to,
  subject,
  text,
  refreshToken,
}: SendEmailParams) {
  try {
    console.log("========== Gmail Send Started ==========");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Subject:", subject);

    console.log("Setting OAuth credentials...");

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    console.log("Creating Gmail client...");

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      text,
    ].join("\r\n");

    const raw = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("Calling Gmail API...");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });

    console.log("Gmail API Success");
    console.log("Message ID:", response.data.id);
    console.log("Thread ID:", response.data.threadId);
    console.log("========== Gmail Send Finished ==========");

    return response.data;
  } catch (error) {
    console.error("========== Gmail API Error ==========");
    console.error(error);
    console.error("======================================");

    throw error;
  }
}