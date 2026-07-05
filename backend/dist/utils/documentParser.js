"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = parseDocument;
const pdf_mjs_1 = require("pdfjs-dist/legacy/build/pdf.mjs");
const errors_1 = require("./errors");
const cleanText_1 = require("./cleanText");
const extractLinks_1 = require("./extractLinks");
function detectLabel(url) {
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
async function extractPdfContent(buffer) {
    const pdf = await (0, pdf_mjs_1.getDocument)({
        data: new Uint8Array(buffer),
    }).promise;
    let text = "";
    const links = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo);
        links.push(...await (0, extractLinks_1.extractLinks)(page));
        const content = await page.getTextContent();
        const pageText = content.items
            .map(item => item.str)
            .join(" ");
        text += pageText + "\n";
    }
    const visibleLinks = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|(?:github|linkedin|leetcode|codeforces)\.com\/[^\s]+)/gi) ?? [];
    for (const url of visibleLinks) {
        if (!links.some(link => link.url === url)) {
            links.push({ url, label: detectLabel(url) });
        }
    }
    return { text, links };
}
async function parseDocument(text, file) {
    if (text?.trim()) {
        return {
            text: (0, cleanText_1.cleanText)(text),
            source: "text",
            links: [],
        };
    }
    if (file) {
        if (file.mimetype !== "application/pdf") {
            throw new errors_1.AIError("INVALID_FILE_TYPE", "Only PDF files are supported.");
        }
        const pdfText = await extractPdfContent(file.buffer);
        return {
            text: (0, cleanText_1.cleanText)(pdfText.text),
            source: "pdf",
            links: pdfText.links,
        };
    }
    throw new errors_1.AIError("NO_DOCUMENT", "Please provide job text or upload a PDF.");
}
