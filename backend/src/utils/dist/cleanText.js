"use strict";
exports.__esModule = true;
exports.cleanText = void 0;
function cleanText(text) {
    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\n{2,}/g, "\n")
        .replace(/\s{2,}/g, " ")
        .trim();
}
exports.cleanText = cleanText;
