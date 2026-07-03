import { groq } from "../client";
import { buildResumeParserPrompt } from "../prompts/resume-prompt";
import { ResumeParserResponse, ResumeParserResponseSchema } from "../schemas/resume-schema";
import { ResumeLink, ResumeSections } from "../config/types";

export async function parseResume(
    rawText: string,
    sections: ResumeSections,
    links: ResumeLink[]
): Promise<ResumeParserResponse> {
    
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type:"json_object"
        },
        
        messages:[
            {
                role:"user",
                content:buildResumeParserPrompt(
                    rawText,
                    sections,
                    links
                )
            }
        ]
    });

    const content = completion.choices[0].message.content ?? "{}";

    const parsed = JSON.parse(content);

    return ResumeParserResponseSchema.parse(parsed);
}