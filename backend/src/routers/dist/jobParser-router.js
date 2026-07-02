"use strict";
exports.__esModule = true;
var express_1 = require("express");
var upload_1 = require("../middleware/upload");
var jobParser_controller_1 = require("../controllers/jobParser-controller");
var router = express_1.Router();
router.post("/job-parser", upload_1.upload.single("jobFile"), jobParser_controller_1.jobParserController);
exports["default"] = router;
