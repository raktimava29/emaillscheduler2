"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSections = extractSections;
const headingAliases_1 = require("./headingAliases");
function normalizeHeading(line) {
    return line.toLowerCase()
        .replace(/[:\-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
function detetctHeading(heading) {
    const normalized = normalizeHeading(heading);
    for (const [key, aliases] of Object.entries(headingAliases_1.SECTION_ALIASES)) {
        if (aliases.includes(normalized)) {
            return key;
        }
    }
    return null;
}
function extractSections(resumeText) {
    const lines = resumeText.split("\n")
        .map(line => line.trim())
        .filter(Boolean);
    const sections = {};
    let currentKey = null;
    for (const line of lines) {
        const heading = detetctHeading(line);
        if (heading) {
            sections[heading] = {
                heading: line,
                content: ""
            };
            currentKey = heading;
            continue;
        }
        if (currentKey) {
            sections[currentKey].content += line + "\n";
        }
    }
    return sections;
}
