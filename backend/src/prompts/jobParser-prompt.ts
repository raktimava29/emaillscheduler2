export function buildJobParserPrompt(jobText: string): string {
return `
You are an expert information extraction engine.

Your ONLY task is to extract structured information from the job description into the EXACT JSON schema provided below.

Return ONLY valid JSON.

Do NOT explain.

Do NOT summarize.

Do NOT use markdown.

Do NOT wrap the response inside code fences.

Rules

- Never hallucinate.
- Never infer missing information.
- If a value is not explicitly stated, return null.
- Every key in the schema must exist.
- Arrays must always exist.
- confidenceScore must be between 0.0 and 1.0.

--------------------------------------------------
COMPANY
--------------------------------------------------

- Extract only if explicitly mentioned.
- If the post starts with "<Company> is hiring", use that company.

--------------------------------------------------
RECIPIENT EMAIL
--------------------------------------------------

- Extract the application email address only.
- Return null if none exists.

--------------------------------------------------
CONTACT NAME
--------------------------------------------------

- Extract only if explicitly mentioned.
- Return null if unspecified.

--------------------------------------------------
ROLES
--------------------------------------------------

Extract EVERY advertised role.

Return them inside the "roles" array.

Each role MUST contain:

- title
- location
- workMode
- employmentType
- experienceRequired
- salary

Never create additional roles.
Only extract roles explicitly advertised.

selectedRole
- Always return null.
- Never automatically select a role.
- The frontend will determine the selected role after the user chooses one.

Rules

- Every advertised role must be represented as its own object.
- Never merge multiple roles.
- Never omit a role.
- Preserve role titles exactly as written whenever practical.
- If a property is not explicitly stated for that role, return null.
- If the same value applies to every role (for example location or work mode), repeat that value for each role.
- If only one role exists, the roles array must still contain exactly one object.
- Never return an empty roles array.

For each role:

workMode must be exactly one of:

- Remote
- Hybrid
- On-Site

or null.

employmentType must be exactly one of:

- Full-Time
- Part-Time
- Internship
- Contract
- Freelance
- Temporary

or null.

Examples

Software Engineer

Remote

Full-Time

2+ Years

↓

{
  "title": "Software Engineer",
  "location": "Remote",
  "workMode": "Remote",
  "employmentType": "Full-Time",
  "experienceRequired": "2+ Years",
  "salary": null
}

--------------------------------------------------
JOINING PREFERENCE
--------------------------------------------------

Normalize common phrases.

Examples

Immediate Joiners Preferred
Immediate Joining
Join Immediately

↓

Immediate

Join within 15 days

↓

Within 15 Days

Return null if not specified.

--------------------------------------------------
SKILLS
--------------------------------------------------

Extract EVERY explicitly required skill or competency that would be evaluated during hiring.

Include

- Programming Languages
- Frameworks
- Libraries
- Databases
- APIs
- Cloud Platforms
- DevOps Tools
- AI / ML Technologies
- Authentication & Security
- Version Control
- Testing
- Architecture Concepts
- Computer Science Fundamentals
  (Operating Systems, Networking, DBMS, OOP, DSA, SDLC)
- Professional Engineering Skills
  (Programming, Debugging, Analytical Skills, Problem Solving)
- Communication or teamwork skills ONLY if explicitly listed as requirements.

Rules

- Extract every skill separately.
- Never merge multiple skills.
- Never infer technologies.
- Preserve the original wording whenever practical.

--------------------------------------------------
APPLICATION DEADLINE
--------------------------------------------------

- Extract only if explicitly mentioned.
- Otherwise return null.

--------------------------------------------------
JOB LINK
--------------------------------------------------

- Extract only if explicitly mentioned.
- Otherwise return null.

--------------------------------------------------
KEYWORDS
--------------------------------------------------

Extract non-technical hiring signals that can help personalize an application.

Examples include:

- Mentorship
- Career Growth
- Learning Opportunities
- Ownership
- Innovation
- Collaborative Culture
- Startup Environment
- Fast-paced Environment
- AI-first Culture
- Customer Focus
- Research
- International Exposure
- Remote-first
- Immediate Hiring

Do NOT include

- Programming Languages
- Frameworks
- Libraries
- Databases
- APIs
- Technical Skills
- Computer Science Subjects
- Company Product Names
- Job Titles

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Return EXACTLY this JSON structure.

{
  "recipientEmail": null,
  "company": null,
  "roles": [
    {
      "title": "",
      "location": null,
      "workMode": null,
      "employmentType": null,
      "experienceRequired": null,
      "salary": null
    }
  ],
  "selectedRole": null,
  "contactName": null,
  "joiningPreference": null,
  "skills": [],
  "applicationDeadline": null,
  "jobLink": null,
  "keywords": [],
  "confidenceScore": 0
}

--------------------------------------------------
JOB DESCRIPTION
--------------------------------------------------

${jobText}
`;
}