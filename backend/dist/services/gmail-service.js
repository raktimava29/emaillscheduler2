"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const googleapis_1 = require("googleapis");
const gmail_1 = require("../config/gmail");
async function sendEmail({ from, to, subject, text, refreshToken, }) {
    try {
        gmail_1.oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });
        const gmail = googleapis_1.google.gmail({
            version: "v1",
            auth: gmail_1.oauth2Client,
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
        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("========== Gmail API Error ==========");
        console.error(error);
        console.error("======================================");
        if (error?.response?.data?.error === "invalid_grant" ||
            error?.cause?.message === "invalid_grant") {
            error.code = "GMAIL_TOKEN_INVALID";
        }
        throw error;
    }
}
