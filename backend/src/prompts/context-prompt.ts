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

Your task is to build the candidate context that will later be used by another AI to write a personalized job application email.

Return ONLY valid JSON.

Do NOT explain.

Do NOT use markdown.

Do NOT wrap the response in code fences.

--------------------------------------------------
GENERAL RULES
--------------------------------------------------

- Use ONLY the provided information.
- Never invent facts.
- Never infer missing information.
- Never modify resume content.
- Preserve the original wording whenever possible.
- Every field in the output schema must exist.
- Arrays must always exist.
- confidenceScore must be between 0.0 and 1.0.

--------------------------------------------------
SELECTED ROLE
--------------------------------------------------

The selectedRole object has already been chosen by the user.

Rules

- Copy the selectedRole object EXACTLY as provided.
- Do NOT modify it.
- Do NOT remove any fields.
- Do NOT infer missing values.
- Do NOT rewrite any values.

--------------------------------------------------
MATCHING RULES
--------------------------------------------------

Compare ONLY against the selectedRole.

Ignore every other role in the job description.

Compare the resume and selectedRole semantically, not by exact wording.

Treat equivalent technologies, frameworks, databases and concepts as matches.

Examples

React ↔ React.js

Node ↔ Node.js

JavaScript ↔ JS

REST APIs ↔ RESTful APIs

SQL ↔ PostgreSQL

SQL ↔ MySQL

HTML/CSS ↔ HTML5 + CSS3

OOP ↔ Object-Oriented Programming

Git ↔ GitHub (when used for version control)

Docker Compose ↔ Docker

Use evidence from ALL parts of the resume:

- Skills
- Projects
- Professional Experience
- Summary

A skill is considered matched if it is demonstrated anywhere in the resume.

When returning matchingSkills:

- Use the wording exactly as it appears in the resume.
- Never rewrite resume terminology using the wording from the job.
- Never invent technologies.
- Never include duplicate skills.

Examples

Job:
ReactJS

Resume:
React.js

Output:
React.js

Job:
HTML/CSS

Resume:
HTML5
CSS3

Output:
[
  "HTML5",
  "CSS3"
]

missingSkills

Include ONLY skills that satisfy ALL of the following:

- Explicitly required by the selected role.
- Not demonstrated anywhere in the resume.
- No equivalent technology exists in the resume.

Never mark equivalent technologies as missing.

Example

Job:
SQL

Resume:
PostgreSQL
MySQL

Output

matchingSkills:
[
  "PostgreSQL",
  "MySQL"
]

missingSkills:
[]

--------------------------------------------------
PROJECT SELECTION
--------------------------------------------------

Include EVERY project that demonstrates one or more skills, technologies, responsibilities or concepts required for the selectedRole.

Rules

- Include all relevant projects.
- Preserve every project exactly as it appears in the resume.
- Never rewrite descriptions.
- Never summarize descriptions.
- Never create new project objects.
- Do not exclude a project simply because another project is stronger.

--------------------------------------------------
EXPERIENCE SELECTION
--------------------------------------------------

Include EVERY professional experience that demonstrates one or more skills, technologies or responsibilities required for the selectedRole.

Rules

- Preserve every experience object exactly as it appears in the resume.
- Never rewrite descriptions.
- Never summarize descriptions.
- Never create new experience objects.

--------------------------------------------------
EDUCATION
--------------------------------------------------

Include education whenever:

- The employer requires a degree.
- The employer prefers a degree.
- The education strengthens the application.

Copy the education object exactly as it appears in the resume.

--------------------------------------------------
ACHIEVEMENTS
--------------------------------------------------

Include achievements that strengthen the application for the selected role.

--------------------------------------------------
KEYWORDS
--------------------------------------------------

Copy hiring-related keywords that are relevant to the selectedRole.

Do not invent keywords.

Do not include:

- Programming languages
- Frameworks
- Databases
- APIs
- Technical skills
- Job titles

Preserve the wording from the job description.

--------------------------------------------------
IMPORTANT
--------------------------------------------------

For these fields:

- relevantProjects
- relevantExperience
- education

Copy COMPLETE OBJECTS directly from the resume.

Do NOT:

- Create new objects.
- Rewrite descriptions.
- Remove fields.
- Summarize content.

--------------------------------------------------
INPUT
--------------------------------------------------

Job
${JSON.stringify(job, null, 2)}

Resume
${JSON.stringify(resume, null, 2)}

--------------------------------------------------
VALIDATION RULES
--------------------------------------------------

Before returning the JSON, verify:

- selectedRole is copied exactly from the input.
- Every matchingSkill appears somewhere in the resume.
- No missingSkill appears anywhere in the resume or as an equivalent technology.
- Every relevantProject exists in the resume.
- Every relevantExperience exists in the resume.
- Every education object exists in the resume.
- No duplicate skills exist.
- No duplicate projects exist.
- No duplicate experience entries exist.

--------------------------------------------------
OUTPUT
--------------------------------------------------

Return EXACTLY this JSON structure.

{
  "candidateName": null,
  "company": null,
  "selectedRole": {
    "title": "",
    "location": null,
    "workMode": null,
    "employmentType": null,
    "experienceRequired": null,
    "salary": null
  },
  "joiningPreference": null,
  "matchingSkills": [
    {
      "jobSkill": "",
      "resumeSkill": ""
    }
  ],
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