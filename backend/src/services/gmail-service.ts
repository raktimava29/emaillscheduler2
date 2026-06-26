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
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

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
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
}