import { ResumeLink, ResumeSections } from "../config/types";

export function buildResumeParserPrompt(
    rawText: string,
    sections: ResumeSections,
    links: ResumeLink[]
): string {

return `
You are an expert resume parsing engine.

Your ONLY task is to extract structured information from the resume.

STRICT RULES

- Return ONLY a valid JSON object.
- Do NOT explain anything.
- Do NOT use markdown.
- Never hallucinate.
- Never invent projects, skills, education, experience or achievements.
- If information is missing, return null.
- Arrays must always exist.
- Preserve dates exactly as written in the resume.
- Do not convert or reformat dates.
- Only include academic scores that are explicitly present.
- Never convert one grading system into another.
- Never estimate GPA, CGPA, SGPA, or percentage.
- The "experience" array must contain ONLY professional work experience.
- Professional work experience includes:
  - Full-Time
  - Internship
  - Part-Time
  - Freelance
- Do NOT include campus ambassador roles, volunteering, leadership positions, clubs, societies, event organizing, hackathons, mentoring, or extracurricular activities in "experience".
- Move those accomplishments into the "achievements" array instead.
- If the resume does not contain any professional work experience, return an empty experience array.
- If a professional experience entry does not specify a company, set "company" to null.
- Extract the candidate's primary phone number if explicitly present.
- Return the phone number exactly as written in the resume.
- Do not normalize, reformat, or infer country codes.
- If no phone number is present, return null.
- confidenceScore must be between 0.0 and 1.0.

IDENTITY EXTRACTION

Extract the candidate's:

- Full name
- Primary phone number
- Professional headline (if present)
- Professional summary/objective (if present)

The phone number must be copied exactly as it appears in the resume.
Do not infer or modify it.

The backend has already extracted helpful information.

Detected Links:

${JSON.stringify(links)}

Detected Sections:

${JSON.stringify(sections, null, 2)}

Complete Resume Text:

${rawText}

Return EXACTLY:

{
  "name": null,
  "phone":null,
  "headline": null,
  "summary": null,

  "education": [
    {
      "degree": "",
      "institution": "",
      "startDate": null,
      "endDate": null,
      "academicScore": {
        "gpa": null,
        "cgpa": null,
        "sgpa": null,
        "percentage": null
      },
      "location": null
    }
  ],

  "experience": [
    {
      "position": "",
      "company": "",
      "startDate": null,
      "endDate": null,
      "location": null,
      "description": []
    }
  ],

  "projects": [
    {
      "name": "",
      "technologies": [],
      "startDate": null,
      "endDate": null,
      "description": []
    }
  ],

  "skills": [],

  "certifications": [],

  "achievements": [],

  "links": [
    {
      "label": null,
      "url": ""
    }
  ],

  "confidenceScore": 0
}
`;
}