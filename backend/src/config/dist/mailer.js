"use strict";
exports.__esModule = true;
exports.transporter = void 0;
var nodemailer_1 = require("nodemailer");
exports.transporter = nodemailer_1["default"].createTransport({
    host: "smtp.ethereal.email",
    port: 465,
    secure: false,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
    }
});
