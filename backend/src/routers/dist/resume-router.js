"use strict";
exports.__esModule = true;
var express_1 = require("express");
var upload_1 = require("../middleware/upload");
var resume_controller_1 = require("../controllers/resume-controller");
var context_controller_1 = require("../controllers/context-controller");
var parser_controller_1 = require("../controllers/parser-controller");
var router = express_1.Router();
router.post("/resume-parser", upload_1.upload.single("resumeFile"), resume_controller_1.resumeParserController);
router.post("/parse", upload_1.upload.fields([
    {
        name: "resumeFile",
        maxCount: 1
    },
    {
        name: "jobFile",
        maxCount: 1
    },
]), parser_controller_1.parseController);
router.post("/context", context_controller_1.contextController);
exports["default"] = router;
