import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { UploadedFile } from "../config/types";
import { AIError } from "./errors";
import { cleanText } from "./cleanText";

export interface ParsedDocument {
    text: string;
    source: "text" | "pdf";
}

async function extractPdfText(
    buffer: Buffer
): Promise<string> {

    const pdf = await getDocument({
        data: new Uint8Array(buffer),
    }).promise;

    let text = "";

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {

        const page = await pdf.getPage(pageNo);

        const content = await page.getTextContent();

        const pageText = content.items
            .map((item: any) => item.str)
            .join(" ");

        text += pageText + "\n";
    }

    return text;
}

export async function parseDocument(
    text?: string,
    file?: UploadedFile
): Promise<ParsedDocument> {

    if (text?.trim()) {
        return {
            text: cleanText(text),
            source: "text",
        };
    }

    if (file) {

        if (file.mimetype !== "application/pdf") {
            throw new AIError(
                "INVALID_FILE_TYPE",
                "Only PDF files are supported."
            );
        }

        const pdfText = await extractPdfText(file.buffer);

        return {
            text: cleanText(pdfText),
            source: "pdf",
        };
    }

    throw new AIError(
        "NO_DOCUMENT",
        "Please provide job text or upload a PDF."
    );
}