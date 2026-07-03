import { Router } from "express";
import { upload } from "../middleware/upload";
import { resumeParserController } from "../controllers/resume-controller";
import { contextController } from "../controllers/context-controller";

const router = Router();

router.post("/resume-parser", upload.single("resumeFile"), resumeParserController);

router.post(
    "/context",
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
    contextController
);

export default router;