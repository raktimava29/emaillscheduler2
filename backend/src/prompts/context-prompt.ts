import { ResumeParserResponse } from "../schemas/resume-schema";
import { JobParserResponse } from "../schemas/jobParser-schema";

export function buildContextPrompt(
    resume: ResumeParserResponse,
    job: JobParserResponse
): string {

return `
You are an experienced technical recruiter.

You will receive:
- A structured job description.
- A structured candidate profile.

Select the information that is most relevant for writing a personalized job application email.

Rules:
- Use ONLY the provided information.
- Do NOT invent, modify or summarize any data.
- Compare the resume and job semantically.
- Select the most relevant skills, projects, experience, education, achievements and keywords.
- Preserve the original wording from the resume whenever possible.
- Return ONLY valid JSON.

Job:
${JSON.stringify(job)}

Resume:
${JSON.stringify(resume)}

Return this JSON:

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