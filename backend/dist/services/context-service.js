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
    const content = completion.choices[0].message.content ?? "{}";
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch {
        throw new Error("LLM returned invalid JSON.");
    }
    console.log("========== Context LLM Output ==========");
    console.log(JSON.stringify(parsed.matchingSkills, null, 2));
    console.log("========================================");
    // Normalize invalid matching skills
    if (Array.isArray(parsed.matchingSkills)) {
        const validSkills = [];
        parsed.missingSkills ?? (parsed.missingSkills = []);
        for (const skill of parsed.matchingSkills) {
            if (typeof skill.resumeSkill === "string" &&
                skill.resumeSkill.trim() !== "") {
                validSkills.push(skill);
            }
            else if (typeof skill.jobSkill === "string" &&
                !parsed.missingSkills.includes(skill.jobSkill)) {
                parsed.missingSkills.push(skill.jobSkill);
            }
        }
        parsed.matchingSkills = validSkills;
    }
    try {
        return candidate_selection_schema_1.CandidateContextSchema.parse(parsed);
    }
    catch (err) {
        console.log("========== FULL CONTEXT RESPONSE ==========");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("===========================================");
        throw err;
    }
}
