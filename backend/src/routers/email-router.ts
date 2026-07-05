import { Router } from "express";
import { scheduleEmails, getScheduledEmails, getSentEmails, getEmailById } from "../controllers/email-controller";
import { requireAuth } from "../middleware/auth";
import { emailGenerationController } from "../controllers/email-generation-controller";

const router = Router();

router.post("/schedule", requireAuth, scheduleEmails);
router.get("/scheduled", requireAuth, getScheduledEmails);
router.get("/sent", requireAuth, getSentEmails);
router.get("/:id", requireAuth, getEmailById);
router.post("/generate", requireAuth, emailGenerationController);

export default router;
