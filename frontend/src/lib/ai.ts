import { apiFetch } from "./api";
import type { ResumeParserResponse } from "../types/resume";
import type { JobParserResponse } from "../types/job";
import type { CandidateContext } from "../types/context";
import type { GeneratedEmail } from "../types/email";

export interface ParseResponse {
    resume: ResumeParserResponse;
    job: JobParserResponse;
}

export async function parseDocuments(
    resumeFile: File,
    jobFile?: File,
    jobText?: string
): Promise<ParseResponse> {
    const formData = new FormData();

    formData.append("resumeFile", resumeFile);

    if (jobFile) {
        formData.append("jobFile", jobFile);
    } else if (jobText?.trim()) {
        formData.append("jobFile", jobText);
    }

    return apiFetch("/ai/parse", {
        method: "POST",
        body: formData,
    });
}

export async function buildContext(
    resume: ResumeParserResponse,
    job: JobParserResponse
): Promise<CandidateContext> {
    return apiFetch("/ai/context", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            resume,
            job,
        }),
    });
}

export async function generateEmail(
    context: CandidateContext
): Promise<GeneratedEmail> {

    return apiFetch("/emails/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(context),
    });
}