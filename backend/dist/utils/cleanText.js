"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanText = cleanText;
function cleanText(text) {
    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\n{2,}/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim();
}
