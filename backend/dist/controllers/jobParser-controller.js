"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobParserController = jobParserController;
const documentParser_1 = require("../utils/documentParser");
const jobParser_service_1 = require("../services/jobParser-service");
const errors_1 = require("../utils/errors");
async function jobParserController(req, res) {
    try {
        const document = await (0, documentParser_1.parseDocument)(req.body.jobText, req.file);
        const result = await (0, jobParser_service_1.parseJob)(document.text);
        res.json(result);
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
            message: "Something went wrong."
        });
    }
}
