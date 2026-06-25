import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER!,
    pass: process.env.ETHEREAL_PASS!,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP Verify Failed:", err);
  } else {
    console.log("SMTP Ready");
  }
});