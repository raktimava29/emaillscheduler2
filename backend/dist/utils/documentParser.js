"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = parseDocument;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const errors_1 = require("./errors");
const cleanText_1 = require("./cleanText");
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
    const data = await (0, pdf_parse_1.default)(buffer);
    const text = data.text;
    const links = [];
    const visibleLinks = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|(?:github(?:\.com)?|linkedin(?:\.com)?\/?(?:in)?|leetcode(?:\.com)?|codeforces(?:\.com)?)\/[^\s]+)/gi) ?? [];
    for (let url of visibleLinks) {
        if (url.startsWith("github/")) {
            url = url.replace("github/", "https://github.com/");
        }
        if (url.startsWith("linkedin/")) {
            url = url.replace("linkedin/", "https://linkedin.com/in/");
        }
        if (url.startsWith("leetcode/")) {
            url = url.replace("leetcode/", "https://leetcode.com/");
        }
        if (url.startsWith("codeforces/")) {
            url = url.replace("codeforces/", "https://codeforces.com/profile/");
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
