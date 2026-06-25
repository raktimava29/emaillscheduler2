"use strict";
exports.__esModule = true;
exports.transporter = void 0;
var nodemailer_1 = require("nodemailer");
exports.transporter = nodemailer_1["default"].createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
    }
});
exports.transporter.verify(function (err) {
    if (err) {
        console.error("SMTP Verify Failed:", err);
    }
    else {
        console.log("SMTP Ready");
    }
});
