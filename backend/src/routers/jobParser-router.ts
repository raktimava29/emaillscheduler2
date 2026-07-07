import { Router } from "express";
import { upload } from "../middleware/upload";
import { jobParserController } from "../controllers/jobParser-controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/job-parser", requireAuth, upload.single("jobFile"), jobParserController);

export default router;