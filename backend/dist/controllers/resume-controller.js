"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeParserController = resumeParserController;
const documentParser_1 = require("../utils/documentParser");
const extractSections_1 = require("../utils/extractSections");
const resume_service_1 = require("../services/resume-service");
const errors_1 = require("../utils/errors");
async function resumeParserController(req, res) {
    try {
        const document = await (0, documentParser_1.parseDocument)(req.body.resumeText, req.file);
        const sections = (0, extractSections_1.extractSections)(document.text);
        const result = await (0, resume_service_1.parseResume)(document.text, sections, document.links);
        return res.json(result);
    }
    catch (err) {
        if (err instanceof errors_1.AIError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message
            });
        }
        console.error(err);
        return res.status(500).json({
            success: false,
            code: "AI_ERROR",
            message: "Something went wrong."
        });
    }
}
