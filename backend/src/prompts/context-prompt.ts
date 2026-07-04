import { ResumeParserResponse } from "../schemas/resume-schema";
import { JobParserResponse } from "../schemas/jobParser-schema";

export function buildContextPrompt(
    resume: ResumeParserResponse,
    job: JobParserResponse
): string {

return `
You are an experienced technical recruiter.

You will receive:
1. A structured job description.
2. A structured candidate profile.

Your task is to prepare the candidate context that will later be used by another AI to write a personalized job application email.

Rules:

- Use ONLY information present in the inputs.
- Never invent facts.
- Never rewrite or summarize resume content.
- Preserve the original wording from the resume.
- Match equivalent technologies when they clearly represent the same skill (for example React and React.js).
- Consider skills demonstrated through projects and professional experience, not only the skills section.
- Only list a skill as missing if it is explicitly required by the job and is not demonstrated anywhere in the resume.
- Select the resume items that provide the strongest evidence for the selected role.
- Rank selected items from most relevant to least relevant.
- confidenceScore must be between 0.0 and 1.0.
- Return ONLY valid JSON.

IMPORTANT

For the following fields, return the COMPLETE OBJECTS copied from the resume.

- relevantProjects
- relevantExperience
- education

Do NOT create new objects.
Do NOT modify any fields.
Copy the selected objects exactly as they appear in the resume.

Selected Role:
${job.selectedJobTitle}

Job:
${JSON.stringify(job)}

Resume:
${JSON.stringify(resume)}

Return EXACTLY this JSON structure:

{
  "candidateName": null,
  "company": null,
  "selectedRole": null,
  "location": null,
  "workMode": null,
  "employmentType": null,
  "joiningPreference": null,
  "matchingSkills": [],
  "missingSkills": [],
  "relevantProjects": [],
  "relevantExperience": [],
  "education": [],
  "achievements": [],
  "keywords": [],
  "confidenceScore": 0
}
`;
}