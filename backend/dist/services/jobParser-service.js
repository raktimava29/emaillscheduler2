"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJob = parseJob;
const client_1 = require("../client");
const jobParser_prompt_1 = require("../prompts/jobParser-prompt");
const jobParser_schema_1 = require("../schemas/jobParser-schema");
const normalize_1 = require("../utils/normalize");
async function parseJob(document) {
    const completion = await client_1.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type: "json_object",
        },
        messages: [
            {
                role: "user",
                content: (0, jobParser_prompt_1.buildJobParserPrompt)(document),
            },
        ],
    });
    const content = completion.choices[0].message.content ?? "{}";
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch {
        throw new Error("AI returned invalid JSON.");
    }
    if (Array.isArray(parsed.roles)) {
        parsed.roles = parsed.roles
            .map((role) => ({
            ...role,
            workMode: (0, normalize_1.normalizeWorkMode)(role.workMode),
            employmentType: (0, normalize_1.normalizeEmploymentType)(role.employmentType),
        }))
            .filter((role, index, self) => index === self.findIndex((r) => r.title.toLowerCase() === role.title.toLowerCase()));
    }
    return jobParser_schema_1.JobParserResponseSchema.parse(parsed);
}
