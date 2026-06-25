import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import { oauth2Client, gmailTokens, saveTokens } from "../config/gmail";

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

  console.log("OAuth URL:", url);
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

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const user = await oauth2.userinfo.get();

    saveTokens({
      accessToken: tokens.access_token ?? undefined,
      refreshToken: tokens.refresh_token ?? undefined,
      email: user.data.email ?? undefined,
    });

    console.log("\n====== Gmail Connected ======");
    console.log("Email:", user.data.email);
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
    console.log("=============================\n");

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
    if (!gmailTokens.refreshToken || !gmailTokens.email) {
      return res.status(400).json({
        error: "Connect Gmail first.",
      });
    }

    oauth2Client.setCredentials({
      refresh_token: gmailTokens.refreshToken,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailTokens.email,
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        refreshToken: gmailTokens.refreshToken,
        accessToken: accessToken.token!,
      },
    });

    await transporter.sendMail({
      from: gmailTokens.email,
      to: gmailTokens.email,
      subject: "ChronoMail Gmail SMTP Test",
      text: "🎉 Gmail OAuth + SMTP is working!",
    });

    return res.json({
      success: true,
      message: "Test email sent!",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to send email",
    });
  }
}