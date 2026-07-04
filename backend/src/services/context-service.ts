import { groq } from "../client";
import { buildContextPrompt } from "../prompts/context-prompt";
import { CandidateContext, CandidateContextSchema } from "../schemas/candidate-selection-schema";
import { ResumeParserResponse } from "../schemas/resume-schema";
import { JobParserResponse } from "../schemas/jobParser-schema";

export async function buildCandidateContext(
    resume: ResumeParserResponse,
    job: JobParserResponse,
    selectedRole: string
): Promise<CandidateContext> {

    const contextJob: JobParserResponse = {
        ...job,
        selectedJobTitle: selectedRole,
    };

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
                    contextJob
                ),
            },
        ],
    });

    const content = completion.choices[0].message.content ?? "{}";

    const parsed = JSON.parse(content);

    return CandidateContextSchema.parse(parsed);
}