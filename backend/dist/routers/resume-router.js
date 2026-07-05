"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const resume_controller_1 = require("../controllers/resume-controller");
const context_controller_1 = require("../controllers/context-controller");
const parser_controller_1 = require("../controllers/parser-controller");
const router = (0, express_1.Router)();
router.post("/resume-parser", upload_1.upload.single("resumeFile"), resume_controller_1.resumeParserController);
router.post("/parse", upload_1.upload.fields([
    {
        name: "resumeFile",
        maxCount: 1,
    },
    {
        name: "jobFile",
        maxCount: 1,
    },
]), parser_controller_1.parseController);
router.post("/context", context_controller_1.contextController);
exports.default = router;
