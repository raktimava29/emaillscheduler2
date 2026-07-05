"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmail = generateEmail;
const client_1 = require("../client");
const email_prompt_1 = require("../prompts/email-prompt");
const email_schema_1 = require("../schemas/email-schema");
const errors_1 = require("../utils/errors");
async function generateEmail(context) {
    try {
        const response = await client_1.gemini.models.generateContent({
            model: "gemini-3.5-flash",
            contents: (0, email_prompt_1.buildEmailPrompt)(context),
        });
        const content = response.text?.trim();
        if (!content) {
            throw new errors_1.AIError("EMPTY_AI_RESPONSE", "The AI returned an empty response", 500);
        }
        const cleaned = content.replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();
        const parsed = JSON.parse(cleaned);
        return email_schema_1.EmailSchema.parse(parsed);
    }
    catch (error) {
        if (error instanceof errors_1.AIError) {
            throw error;
        }
        throw new errors_1.AIError("EMAIL_GENERATION_FAILED", "Failed to generate the application email.", 500);
    }
}
