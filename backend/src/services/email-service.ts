import { gemini } from "../client";
import { buildEmailPrompt } from "../prompts/email-prompt";
import { CandidateContext } from "../schemas/candidate-selection-schema";
import { EmailResponse, EmailSchema } from "../schemas/email-schema";
import { AIError } from "../utils/errors";

export async function generateEmail(
    context: CandidateContext
): Promise<EmailResponse> {
    try {
        const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildEmailPrompt(context),
    });
        
        //console.log(typeof response.text);
        const content = response.text?.trim();

        if (!content) {
            throw new AIError(
                "EMPTY_AI_RESPONSE",
                "The AI returned an empty response",
                500
            )
        }

        const cleaned = content.replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/```$/i, "")
                        .trim();

        const parsed = JSON.parse(cleaned);

        return EmailSchema.parse(parsed);
    } catch (error) {
        console.error("Email generation error:");
        console.error(error);

        if (error instanceof AIError) {
            throw error;
        }

        throw new AIError(
            "EMAIL_GENERATION_FAILED",
            "Failed to generate the application email.",
            500
        );
    }
}