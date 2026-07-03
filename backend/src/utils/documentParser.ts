import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ResumeLink, UploadedFile } from "../config/types";
import { AIError } from "./errors";
import { cleanText } from "./cleanText";
import { extractLinks } from "./extractLinks";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

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
        text: string, links: ResumeLink[];
    }> {

    const pdf = await getDocument({
        data: new Uint8Array(buffer),
    }).promise;

    let text = "";
    const links: ResumeLink[] = [];

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {

        const page = await pdf.getPage(pageNo);

        links.push(...await extractLinks(page));

        const content = await page.getTextContent();

        const pageText = content.items
            .map(item => (item as TextItem).str)
            .join(" ");

        text += pageText + "\n";
    }

    const visibleLinks = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|(?:github|linkedin|leetcode|codeforces)\.com\/[^\s]+)/gi) ?? [];

    for (const url of visibleLinks) {
        if (!links.some(link => link.url === url)) {
            links.push({ url, label: detectLabel(url) });
        }
    }

    return {text, links};
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