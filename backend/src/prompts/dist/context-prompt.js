"use strict";
exports.__esModule = true;
exports.buildContextPrompt = void 0;
function buildContextPrompt(resume, job) {
    return "\nYou are an experienced technical recruiter.\n\nYou will receive:\n- A structured job description.\n- A structured candidate profile.\n\nSelect the information that is most relevant for writing a personalized job application email.\n\nRules:\n- Use ONLY the provided information.\n- Do NOT invent, modify or summarize any data.\n- Compare the resume and job semantically.\n- Select the most relevant skills, projects, experience, education, achievements and keywords.\n- Preserve the original wording from the resume whenever possible.\n- Return ONLY valid JSON.\n\nJob:\n" + JSON.stringify(job) + "\n\nResume:\n" + JSON.stringify(resume) + "\n\nReturn this JSON:\n\n{\n  \"candidateName\": null,\n  \"company\": null,\n  \"selectedRole\": null,\n  \"location\": null,\n  \"workMode\": null,\n  \"employmentType\": null,\n  \"joiningPreference\": null,\n  \"matchingSkills\": [],\n  \"missingSkills\": [],\n  \"relevantProjects\": [],\n  \"relevantExperience\": [],\n  \"education\": [],\n  \"achievements\": [],\n  \"keywords\": [],\n  \"confidenceScore\": 0\n}\n";
}
exports.buildContextPrompt = buildContextPrompt;
