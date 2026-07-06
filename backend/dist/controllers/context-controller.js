"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextController = contextController;
const context_service_1 = require("../services/context-service");
const errors_1 = require("../utils/errors");
async function contextController(req, res) {
    try {
        const { resume, job } = req.body;
        const context = await (0, context_service_1.buildCandidateContext)(resume, job);
        return res.json(context);
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
