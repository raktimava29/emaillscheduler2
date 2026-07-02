import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emailRoutes from "./routers/email-router";
import { db } from "./config/db";
import passport from "./config/passport";
import authRoutes from "./routers/login-router";
import { startWorker } from "./config/worker";
import { allowedOrigins, requireTrustedOrigin } from "./config/security";
import gmailRouter from "./routers/gmail-router"
import jobParserRoutes from "./routers/jobParser-router";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(requireTrustedOrigin);

app.use(passport.initialize());
app.use("/gmail", gmailRouter);

app.get("/", async (_req, res) => {
  const { rows } = await db.query("SELECT 'API running' AS msg");
  res.json(rows);
});

app.use("/emails", emailRoutes);
app.use("/auth", authRoutes);
app.use("/ai", jobParserRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startWorker();
});
