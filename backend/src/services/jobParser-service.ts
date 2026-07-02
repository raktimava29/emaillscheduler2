import { groq } from "../client";
import { buildJobParserPrompt } from "../prompts/jobParser-prompt";
import { JobParserResponse, JobParserResponseSchema } from "../schemas/jobParser-schema";
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

    const parsed = JSON.parse(content);
    parsed.workMode = normalizeWorkMode(parsed.workMode);
    parsed.employmentType = normalizeEmploymentType(parsed.employmentType);

    return JobParserResponseSchema.parse(parsed);
}