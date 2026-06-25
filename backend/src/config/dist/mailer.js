"use strict";
exports.__esModule = true;
exports.transporter = void 0;
var nodemailer_1 = require("nodemailer");
exports.transporter = nodemailer_1["default"].createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
    }
});
