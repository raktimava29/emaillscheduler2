import { groq } from "../client";
import { buildContextPrompt } from "../prompts/context-prompt";
import { ContextSelectionSchema, ContextSelection } from "../schemas/context-selection-schema";
import { CandidateContext,  CandidateContextSchema} from "../schemas/candidate-selection";
import { ResumeParserResponse } from "../schemas/resume-schema";
import { JobParserResponse } from "../schemas/jobParser-schema";

export async function buildCandidateContext(
    resume: ResumeParserResponse,
    job: JobParserResponse
): Promise<CandidateContext> {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: {
            type:"json_object"
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

    const parsed = JSON.parse(content);

    const selection = ContextSelectionSchema.parse(parsed);

    const relevantProjects = resume.projects.filter(project =>
        selection.relevantProjects.some(
            name => name.toLowerCase() === project.name.toLowerCase()
        )
    );

    const relevantExperience = resume.experience.filter(exp =>
        selection.relevantExperience.some(
            position =>
                position.toLowerCase() ===
                (exp.position ?? "").toLowerCase()
        )
    );

    const education = resume.education.filter(edu =>
        selection.education.some(
            degree =>
                degree.toLowerCase() ===
                edu.degree.toLowerCase()
        )
    );

    return CandidateContextSchema.parse({
        ...selection,
        relevantProjects,
        relevantExperience,
        education,
    });
}