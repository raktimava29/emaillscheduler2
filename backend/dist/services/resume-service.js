"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResume = parseResume;
const client_1 = require("../client");
const resume_prompt_1 = require("../prompts/resume-prompt");
const resume_schema_1 = require("../schemas/resume-schema");
async function parseResume(rawText, sections, links) {
    const completion = await client_1.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type: "json_object"
        },
        messages: [
            {
                role: "user",
                content: (0, resume_prompt_1.buildResumeParserPrompt)(rawText, sections, links)
            }
        ]
    });
    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content);
    parsed.links = (parsed.links ?? []).filter((link) => typeof link.url === "string" &&
        link.url.trim() !== "");
    console.log("========== Resume LLM Output ==========");
    console.log(JSON.stringify(parsed.links, null, 2));
    console.log("=======================================");
    try {
        return resume_schema_1.ResumeParserResponseSchema.parse(parsed);
    }
    catch (err) {
        console.log("========== FULL AI RESPONSE ==========");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("======================================");
        throw err;
    }
}
