"use strict";
exports.__esModule = true;
exports.extractSections = void 0;
var headingAliases_1 = require("./headingAliases");
function normalizeHeading(line) {
    return line.toLowerCase()
        .replace(/[:\-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
function detetctHeading(heading) {
    var normalized = normalizeHeading(heading);
    for (var _i = 0, _a = Object.entries(headingAliases_1.SECTION_ALIASES); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], aliases = _b[1];
        if (aliases.includes(normalized)) {
            return key;
        }
    }
    return null;
}
function extractSections(resumeText) {
    var lines = resumeText.split("\n")
        .map(function (line) { return line.trim(); })
        .filter(Boolean);
    var sections = {};
    var currentKey = null;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var heading = detetctHeading(line);
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
exports.extractSections = extractSections;
