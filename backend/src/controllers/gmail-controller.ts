import { Request, Response } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/gmail";
import { db } from "../config/db";
import { sendEmail } from "../services/gmail-service";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://mail.google.com/",
];

export function connectGmail(req: Request, res: Response) {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(url);
}

export async function gmailCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({
        error: "Missing authorization code",
      });
    }

    const currentUser = (req as any).user;

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const user = await oauth2.userinfo.get();

    if (currentUser.email !== user.data.email) {
      return res.status(400).json({
        error:
          "The selected Gmail account does not match your logged-in account.",
      });
    }

  if (tokens.refresh_token) {
    await db.query(
      `
      UPDATE users
      SET gmail_refresh_token = $1
      WHERE id = $2
      `,
      [
        tokens.refresh_token,
        currentUser.userId,
      ]
    );
  }

    return res.json({
      success: true,
      email: user.data.email,
      message: "Gmail connected successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to connect Gmail",
    });
  }
}

export async function sendTestMail(req: Request, res: Response) {
  try {
    const currentUser = (req as any).user;

    const { rows } = await db.query(
      `
      SELECT
        email,
        gmail_refresh_token
      FROM users
      WHERE id = $1
      `,
      [currentUser.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const { email, gmail_refresh_token } = rows[0];

    if (!gmail_refresh_token) {
      return res.status(400).json({
        error: "Connect Gmail first.",
      });
    }

    await sendEmail({
      from: email,
      to: email,
      subject: "ChronoMail Gmail API Test",
      text: "🎉 Gmail API is working!",
      refreshToken: gmail_refresh_token,
    });

    return res.json({
      success: true,
      message: "Test email sent.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to send email",
    });
  }
}