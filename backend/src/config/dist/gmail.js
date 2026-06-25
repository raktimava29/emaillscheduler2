"use strict";
exports.__esModule = true;
exports.saveTokens = exports.gmailTokens = exports.oauth2Client = void 0;
var googleapis_1 = require("googleapis");
exports.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_GMAIL_CALLBACK_URL);
exports.gmailTokens = {};
function saveTokens(tokens) {
    exports.gmailTokens = tokens;
}
exports.saveTokens = saveTokens;
