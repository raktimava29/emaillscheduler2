import pdfParse from "pdf-parse";
import { ResumeLink, UploadedFile } from "../config/types";
import { AIError } from "./errors";
import { cleanText } from "./cleanText";

export interface ParsedDocument {
    text: string;
    source: "text" | "pdf";
    links: ResumeLink[];
}

function detectLabel(
    url: string
): string | undefined {
    const value = url.toLowerCase();

    if (value.includes("github")) {
        return "GitHub";
    }

    if (value.includes("linkedin")) {
        return "LinkedIn";
    }

    if (value.includes("leetcode")) {
        return "LeetCode";
    }

    if (value.includes("codeforces")) {
        return "Codeforces";
    }

    if (value.includes("portfolio")) {
        return "Portfolio";
    }

    return undefined;
}

async function extractPdfContent(
    buffer: Buffer
): Promise<{
    text: string;
    links: ResumeLink[];
}> {

    const data = await pdfParse(buffer);
    const text = data.text;

    const links: ResumeLink[] = [];

    const visibleLinks =
        text.match(
            /(https?:\/\/[^\s]+|www\.[^\s]+|(?:github(?:\.com)?|linkedin(?:\.com)?\/?(?:in)?|leetcode(?:\.com)?|codeforces(?:\.com)?)\/[^\s]+)/gi
        ) ?? [];

    for (let url of visibleLinks) {
        if (
            url.startsWith("github/")
        ) {
            url = url.replace(
                "github/",
                "https://github.com/"
            );
        }

        if (
            url.startsWith("linkedin/")
        ) {
            url = url.replace(
                "linkedin/",
                "https://linkedin.com/in/"
            );
        }

        if (
            url.startsWith("leetcode/")
        ) {
            url = url.replace(
                "leetcode/",
                "https://leetcode.com/"
            );
        }

        if (
            url.startsWith("codeforces/")
        ) {
            url = url.replace(
                "codeforces/",
                "https://codeforces.com/profile/"
            );
        }

        if (!links.some(link => link.url === url)) {
            links.push({
                url,
                label: detectLabel(url),
            });
        }
    }

    return {
        text,
        links,
    };
}

export async function parseDocument(
    text?: string,
    file?: UploadedFile
): Promise<ParsedDocument> {

    if (text?.trim()) {
        return {
            text: cleanText(text),
            source: "text",
            links: [],
        };
    }

    if (file) {

        if (file.mimetype !== "application/pdf") {
            throw new AIError(
                "INVALID_FILE_TYPE",
                "Only PDF files are supported."
            );
        }

        const pdfText = await extractPdfContent(file.buffer);

        return {
            text: cleanText(pdfText.text),
            source: "pdf",
            links: pdfText.links,
        };
    }

    throw new AIError(
        "NO_DOCUMENT",
        "Please provide job text or upload a PDF."
    );
}