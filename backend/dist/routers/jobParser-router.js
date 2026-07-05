"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const jobParser_controller_1 = require("../controllers/jobParser-controller");
const router = (0, express_1.Router)();
router.post("/job-parser", upload_1.upload.single("jobFile"), jobParser_controller_1.jobParserController);
exports.default = router;
