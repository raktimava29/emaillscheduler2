import { Router } from "express";
import { upload } from "../middleware/upload";
import { jobParserController } from "../controllers/jobParser-controller";

const router = Router();

router.post("/job-parser", upload.single("jobFile"), jobParserController);

export default router;