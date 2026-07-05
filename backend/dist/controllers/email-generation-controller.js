"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailGenerationController = emailGenerationController;
const email_service_1 = require("../services/email-service");
const candidate_selection_schema_1 = require("../schemas/candidate-selection-schema");
const errors_1 = require("../utils/errors");
async function emailGenerationController(req, res) {
    try {
        const context = candidate_selection_schema_1.CandidateContextSchema.parse(req.body);
        const email = await (0, email_service_1.generateEmail)(context);
        return res.json(email);
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
