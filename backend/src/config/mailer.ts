import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ETHEREAL_USER!,
    pass: process.env.ETHEREAL_PASS!,
  },
});
