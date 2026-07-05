"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectGmail = connectGmail;
exports.gmailCallback = gmailCallback;
exports.sendTestMail = sendTestMail;
const googleapis_1 = require("googleapis");
const gmail_1 = require("../config/gmail");
const db_1 = require("../config/db");
const gmail_service_1 = require("../services/gmail-service");
const SCOPES = [
    "openid",
    "email",
    "profile",
    "https://mail.google.com/",
];
function connectGmail(req, res) {
    const url = gmail_1.oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
    });
    res.redirect(url);
}
async function gmailCallback(req, res) {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).json({
                error: "Missing authorization code",
            });
        }
        const currentUser = req.user;
        const { tokens } = await gmail_1.oauth2Client.getToken(code);
        gmail_1.oauth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({
            auth: gmail_1.oauth2Client,
            version: "v2",
        });
        const user = await oauth2.userinfo.get();
        if (currentUser.email !== user.data.email) {
            return res.status(400).json({
                error: "The selected Gmail account does not match your logged-in account.",
            });
        }
        if (tokens.refresh_token) {
            await db_1.db.query(`
      UPDATE users
      SET gmail_refresh_token = $1
      WHERE id = $2
      `, [
                tokens.refresh_token,
                currentUser.userId,
            ]);
        }
        return res.redirect(`${process.env.FRONTEND_URL}/compose?gmail=connected`);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to connect Gmail",
        });
    }
}
async function sendTestMail(req, res) {
    try {
        const currentUser = req.user;
        const { rows } = await db_1.db.query(`
      SELECT
        email,
        gmail_refresh_token
      FROM users
      WHERE id = $1
      `, [currentUser.userId]);
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
        await (0, gmail_service_1.sendEmail)({
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Failed to send email",
        });
    }
}
