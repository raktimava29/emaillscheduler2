import nodemailer from "nodemailer";

import net from "net";

import dns from "dns/promises";

(async () => {
  try {
    const result = await dns.lookup("smtp.ethereal.email");
    console.log("DNS:", result);
  } catch (err) {
    console.error("DNS failed:", err);
  }
})();

const socket = net.createConnection(587, "smtp.ethereal.email");

socket.setTimeout(10000);

socket.on("connect", () => {
  console.log("TCP CONNECTED");
  socket.end();
});

socket.on("timeout", () => {
  console.log("TCP TIMEOUT");
  socket.destroy();
});

socket.on("error", (err) => {
  console.log("TCP ERROR", err);
});



export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 465,
  secure: false,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  auth: {
    user: process.env.ETHEREAL_USER!,
    pass: process.env.ETHEREAL_PASS!,
  },
});