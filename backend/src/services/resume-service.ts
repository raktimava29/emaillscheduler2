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