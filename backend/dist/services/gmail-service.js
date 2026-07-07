"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const googleapis_1 = require("googleapis");
const gmail_1 = require("../config/gmail");
const crypto_1 = require("crypto");
async function sendEmail({ from, to, subject, text, refreshToken, attachment }) {
    try {
        gmail_1.oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });
        const gmail = googleapis_1.google.gmail({
            version: "v1",
            auth: gmail_1.oauth2Client,
        });
        let message;
        if (!attachment) {
            message = [
                `From: ${from}`,
                `To: ${to}`,
                `Subject: ${subject}`,
                "MIME-Version: 1.0",
                "Content-Type: text/plain; charset=UTF-8",
                "",
                text,
            ].join("\r\n");
        }
        else {
            const boundary = `boundary_${(0, crypto_1.randomUUID)()}`;
            message = [
                `From: ${from}`,
                `To: ${to}`,
                `Subject: ${subject}`,
                "MIME-Version: 1.0",
                `Content-Type: multipart/mixed; boundary="${boundary}"`,
                "",
                `--${boundary}`,
                "Content-Type: text/plain; charset=UTF-8",
                "",
                text,
                "",
                `--${boundary}`,
                "Content-Type: application/octet-stream",
                "Content-Transfer-Encoding: base64",
                `Content-Disposition: attachment; filename="${attachment.filename}"`,
                "",
                attachment.content.toString("base64"),
                "",
                `--${boundary}--`,
            ].join("\r\n");
        }
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
