import { groq } from "../client";
import { buildContextPrompt } from "../prompts/context-prompt";
import { CandidateContext, CandidateContextSchema } from "../schemas/candidate-selection-schema";
import { ResumeParserResponse } from "../schemas/resume-schema";
import { JobParserResponse } from "../schemas/jobParser-schema";

export async function buildCandidateContext(
    resume: ResumeParserResponse,
    job: JobParserResponse,
): Promise<CandidateContext> {

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type: "json_object",
        },
        messages: [
            {
                role: "user",
                content: buildContextPrompt(
                    resume,
                    job
                ),
            },
        ],
    });

    const content = completion.choices[0].message.content ?? "{}";

    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("LLM returned invalid JSON.");
    }

    console.log("========== Context LLM Output ==========");
    // console.log(JSON.stringify(parsed.matchingSkills, null, 2));
    // console.log("========================================");

// Normalize invalid matching skills
if (Array.isArray(parsed.matchingSkills)) {
    const validSkills = [];
    parsed.missingSkills ??= [];

    for (const skill of parsed.matchingSkills) {
        if (
            typeof skill.resumeSkill === "string" &&
            skill.resumeSkill.trim() !== ""
        ) {
            validSkills.push(skill);
        } else if (
            typeof skill.jobSkill === "string" &&
            !parsed.missingSkills.includes(skill.jobSkill)
        ) {
            parsed.missingSkills.push(skill.jobSkill);
        }
    }

    parsed.matchingSkills = validSkills;
}

try {
    return CandidateContextSchema.parse(parsed);
} catch (err) {
    console.log("========== FULL CONTEXT RESPONSE ==========");
    // console.log(JSON.stringify(parsed, null, 2));
    // console.log("===========================================");

    throw err;
}
}