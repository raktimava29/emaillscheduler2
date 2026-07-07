import { Router } from "express";
import { upload } from "../middleware/upload";
import { resumeParserController } from "../controllers/resume-controller";
import { contextController } from "../controllers/context-controller";
import { parseController } from "../controllers/parser-controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/resume-parser", requireAuth, upload.single("resumeFile"), resumeParserController);

router.post(
    "/parse",
    requireAuth,
    upload.fields([
        {
            name: "resumeFile",
            maxCount: 1,
        },
        {
            name: "jobFile",
            maxCount: 1,
        },
    ]),
    parseController
);

router.post("/context", requireAuth, contextController);

export default router;