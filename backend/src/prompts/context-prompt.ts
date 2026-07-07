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
- Never fabricate resume evidence to satisfy a job requirement.
- If no evidence exists in the resume, place the job skill in missingSkills instead.
- Preserve the original wording whenever possible.
- Every field in the output schema must exist.
- Do not omit fields because their values are unknown.
- Use null for unknown scalar values.
- Arrays must always exist.
- If an array has no items, return an empty array [].
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
CANDIDATE INFORMATION
--------------------------------------------------

Copy the following values directly from the parsed resume.

Resume field "name" -> Output field "candidateName"

Resume field "phone" -> Output field "phone"

Resume field "email" -> Output field "email"

Resume field "links" -> Output field "links"

Do not modify any values.

If a value is unavailable, return null.

If no links exist, return an empty array.

The contactName must come only from the job description.

If no recruiter or hiring contact is provided, return null.

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

Java and JavaScript are completely different languages.

Never treat them as equivalent.

Do not match one to the other under any circumstance.

Use evidence from ALL parts of the resume:

- Skills
- Projects
- Professional Experience
- Summary

A skill is considered matched if it is demonstrated anywhere in the resume.

When returning matchingSkills:

- Each entry must contain BOTH the job skill and the matching resume skill.
- Use the job wording exactly as it appears in the job description.
- Use the resume wording exactly as it appears in the resume.
- Never invent technologies.
- Never return null or empty strings.
- Never include duplicate jobSkill/resumeSkill pairs.

Examples

Job:
ReactJS

Resume:
React.js

Output

{
  "jobSkill": "ReactJS",
  "resumeSkill": "React.js"
}

Job:
SQL

Resume:
PostgreSQL

Output

{
  "jobSkill": "SQL",
  "resumeSkill": "PostgreSQL"
}

Every required job skill MUST belong to exactly ONE category.

Category 1:
matchingSkills

If the resume demonstrates the skill or an equivalent technology, create exactly one object:

{
  "jobSkill": "...",
  "resumeSkill": "..."
}

Category 2:
missingSkills

If the resume does NOT demonstrate the skill, do NOT create a matchingSkills object.

Instead, add ONLY the job skill name to missingSkills.

A missing skill MUST NOT also appear in matchingSkills.

If resume evidence cannot be found, delete the matchingSkills object entirely rather than using null, an empty string, or a guessed value.

Rules

- Every job skill appears exactly once.
- A job skill can never appear in both matchingSkills and missingSkills.
- Never create a matchingSkills object whose resumeSkill is null.
- Never create a matchingSkills object whose resumeSkill is an empty string.
- Never invent a resumeSkill.
- Never guess a resumeSkill.
- If no matching resume evidence exists, place the job skill in missingSkills instead.

Example

Job Skills

ReactJS
SQL
Docker
Java

Resume Skills

React.js
PostgreSQL
Docker

Output

matchingSkills

[
  {
    "jobSkill": "ReactJS",
    "resumeSkill": "React.js"
  },
  {
    "jobSkill": "SQL",
    "resumeSkill": "PostgreSQL"
  },
  {
    "jobSkill": "Docker",
    "resumeSkill": "Docker"
  }
]

missingSkills

[
  "Java"
]

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

- Every required top-level field in the output schema exists exactly once.
- Every job skill appears exactly once.
- A job skill cannot appear in both matchingSkills and missingSkills.
- Every matchingSkills.resumeSkill is a non-empty string.
- Every matchingSkills.jobSkill is a non-empty string.
- Every links entry contains a non-empty url.

Before returning the JSON, verify:

- phone exists (null if unavailable).
- email exists (null if unavailable).
- links always exists (empty array if none).
- contactName exists (null if unavailable).
- candidateName exists (null if unavailable).
- company exists (null if unavailable).
- joiningPreference exists (null if unavailable).
- selectedRole is copied exactly from the input.
- Every matchingSkills entry contains BOTH jobSkill and resumeSkill.
- Every jobSkill exists in the selected role.
- Every resumeSkill exists somewhere in the resume.
- No matchingSkills entry contains null or empty strings.
- No missingSkill appears anywhere in the resume or as an equivalent technology.
- Every relevantProject exists in the resume.
- Every relevantExperience exists in the resume.
- Every education object exists in the resume.
- No duplicate matchingSkills exist.
- No duplicate projects exist.
- No duplicate experience entries exist.

--------------------------------------------------
OUTPUT
--------------------------------------------------

Return EXACTLY this JSON structure.

{
  "candidateName": null,
  "phone": null,
  "email": null,

  "links": [
    {
      "label": null,
      "url": ""
    }
  ],
  "contactName": null,
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
      "jobSkill": "ReactJS",
      "resumeSkill": "React.js"
    },
    {
      "jobSkill": "SQL",
      "resumeSkill": "PostgreSQL"
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