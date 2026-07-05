import { groq } from "../client";
import { buildJobParserPrompt } from "../prompts/jobParser-prompt";
import { JobParserResponse, JobParserResponseSchema } from "../schemas/jobParser-schema";
import type { Role } from "../schemas/jobParser-schema";
import { normalizeEmploymentType, normalizeWorkMode } from "../utils/normalize";

export async function parseJob(
    document: string
): Promise<JobParserResponse> {

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type: "json_object",
        },
        messages: [
            {
                role: "user",
                content: buildJobParserPrompt(document),
            },
        ],
    });

    const content = completion.choices[0].message.content ?? "{}";

    let parsed: any;

    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("AI returned invalid JSON.");
    }
    
    if (Array.isArray(parsed.roles)) {
        parsed.roles = (parsed.roles as Role[])
            .map((role) => ({
                ...role,
                workMode: normalizeWorkMode(role.workMode),
                employmentType: normalizeEmploymentType(role.employmentType),
            }))
            .filter(
                (role, index, self) =>
                    index === self.findIndex((r) => r.title.toLowerCase() === role.title.toLowerCase())
            );
        }
    
    return JobParserResponseSchema.parse(parsed);
}