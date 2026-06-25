import { Router } from "express";
import {
  connectGmail,
  gmailCallback,
  sendTestMail,
} from "../controllers/gmail-controller";

const router = Router();

router.get("/connect", connectGmail);

router.get("/callback", gmailCallback);

router.post("/test", sendTestMail);

export default router;