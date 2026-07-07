"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseController = parseController;
const documentParser_1 = require("../utils/documentParser");
const resume_service_1 = require("../services/resume-service");
const jobParser_service_1 = require("../services/jobParser-service");
const extractSections_1 = require("../utils/extractSections");
const errors_1 = require("../utils/errors");
async function parseController(req, res) {
    try {
        const files = req.files;
        const hasResume = Boolean(req.body.resumeFile?.trim()) ||
            Boolean(files?.resumeFile?.[0]);
        const hasJob = Boolean(req.body.jobFile?.trim()) ||
            Boolean(files?.jobFile?.[0]);
        if (!hasResume) {
            throw new errors_1.AIError("MISSING_RESUME", "Provide either resumeFile as text or upload a resume file.", 400);
        }
        if (!hasJob) {
            throw new errors_1.AIError("MISSING_JOB", "Provide either jobFile as text or upload a job file.", 400);
        }
        const resumeDocument = await (0, documentParser_1.parseDocument)(req.body.resumeFile, files?.resumeFile?.[0]);
        console.log("========== Extracted Links ==========");
        // console.log(JSON.stringify(resumeDocument.links, null, 2));
        // console.log("=====================================");
        const resumeSections = (0, extractSections_1.extractSections)(resumeDocument.text);
        const resume = await (0, resume_service_1.parseResume)(resumeDocument.text, resumeSections, resumeDocument.links);
        const jobDocument = await (0, documentParser_1.parseDocument)(req.body.jobFile, files?.jobFile?.[0]);
        const job = await (0, jobParser_service_1.parseJob)(jobDocument.text);
        return res.json({
            resume,
            job,
        });
    }
    catch (err) {
        if (err instanceof errors_1.AIError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message,
            });
        }
        console.error(err);
        return res.status(500).json({
            success: false,
            code: "AI_ERROR",
            message: "Something went wrong.",
        });
    }
}
