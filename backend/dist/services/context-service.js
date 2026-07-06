"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCandidateContext = buildCandidateContext;
const client_1 = require("../client");
const context_prompt_1 = require("../prompts/context-prompt");
const candidate_selection_schema_1 = require("../schemas/candidate-selection-schema");
async function buildCandidateContext(resume, job) {
    const completion = await client_1.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type: "json_object",
        },
        messages: [
            {
                role: "user",
                content: (0, context_prompt_1.buildContextPrompt)(resume, job),
            },
        ],
    });
    const email = resume.links.find(link => link.url.startsWith("mailto:"))?.url.replace("mailto:", "") ?? null;
    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content);
    return candidate_selection_schema_1.CandidateContextSchema.parse({
        ...parsed,
        phone: resume.phone,
        email,
        links: resume.links,
        contactName: job.contactName
    });
}
