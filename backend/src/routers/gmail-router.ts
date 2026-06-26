import { Router } from "express";
import {
  connectGmail,
  gmailCallback,
  sendTestMail,
} from "../controllers/gmail-controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/connect", requireAuth, connectGmail);

router.get("/callback", requireAuth, gmailCallback);

router.post("/test", requireAuth, sendTestMail);

export default router;