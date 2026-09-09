import { groq } from "../client";
import { buildResumeParserPrompt } from "../prompts/resume-prompt";
import { ResumeParserResponse, ResumeParserResponseSchema } from "../schemas/resume-schema";
import { ResumeLink, ResumeSections } from "../config/types";
import z from "zod";

export async function parseResume(
    rawText: string,
    sections: ResumeSections,
    links: ResumeLink[]
): Promise<ResumeParserResponse> {
    
    const completion = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        temperature: 0,
        reasoning_format: "hidden",
        reasoning_effort: "none",          
        max_completion_tokens: 850, 
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "resume_parser_response",
                strict: true,
                schema: z.toJSONSchema(ResumeParserResponseSchema),
            },
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

    parsed.links = (parsed.links ?? []).filter(
        (link: any) =>
            typeof link.url === "string" &&
            link.url.trim() !== ""
    );

    console.log("========== Resume LLM Output ==========");
    // console.log(JSON.stringify(parsed.links, null, 2));
    // console.log("=======================================");

    try {
        return ResumeParserResponseSchema.parse(parsed);
    } catch (err) {
        console.log("========== FULL AI RESPONSE ==========");
        // console.log(JSON.stringify(parsed, null, 2));
        // console.log("======================================");

        throw err;
    }
}