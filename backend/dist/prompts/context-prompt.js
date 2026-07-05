"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContextPrompt = buildContextPrompt;
function buildContextPrompt(resume, job) {
    return `
You are an experienced technical recruiter.

You will receive:

1. A structured job description.
2. A structured candidate profile.

Your task is to build the candidate context that will later be used by another AI to write a personalized job application email.

GENERAL RULES

- Use ONLY the provided information.
- Never invent, infer or modify facts.
- Preserve the original wording from the resume whenever possible.
- Return ONLY valid JSON.
- confidenceScore must be between 0.0 and 1.0.

MATCHING RULES

- Compare the resume and job semantically, not by exact wording.
- Treat equivalent technologies as matches (for example React and React.js, OOP and Object-Oriented Programming).
- Consider skills demonstrated through projects and professional experience, not only the skills section.
- Only include a skill in "missingSkills" if it is explicitly required by the job and is NOT demonstrated anywhere in the resume.

PROJECT SELECTION

- Include EVERY project that demonstrates one or more required skills, technologies, responsibilities or concepts.
- Do NOT exclude a project simply because another project is more relevant.
- If multiple projects are relevant, return all of them.
- Preserve each selected project exactly as it appears in the resume.

EXPERIENCE SELECTION

- Include EVERY professional experience that demonstrates one or more required skills, technologies or responsibilities.
- Do NOT omit an experience because another one is stronger.
- Preserve each selected experience exactly as it appears in the resume.

EDUCATION SELECTION

- Include education whenever:
  - the employer requires or prefers a degree,
  - or the education strengthens the application.
- Preserve the education object exactly as it appears in the resume.

ACHIEVEMENTS

- Include achievements that strengthen the application for the selected role.

KEYWORDS

- Preserve relevant hiring-related keywords from the job description.

IMPORTANT

For these fields, return COMPLETE OBJECTS copied directly from the resume:

- relevantProjects
- relevantExperience
- education

Do NOT create new objects.
Do NOT rewrite any descriptions.
Do NOT remove fields.
Copy the objects exactly as they appear in the resume.

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
