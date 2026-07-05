"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWorkMode = normalizeWorkMode;
exports.normalizeEmploymentType = normalizeEmploymentType;
function normalizeWorkMode(workMode) {
    if (!workMode)
        return null;
    const value = workMode.toLowerCase();
    if (value.includes("remote") ||
        value.includes("wfh") ||
        value.includes("work from home")) {
        return "Remote";
    }
    if (value.includes("hybrid")) {
        return "Hybrid";
    }
    if (value.includes("on-site") ||
        value.includes("on site") ||
        value.includes("onsite") ||
        value.includes("office")) {
        return "On-Site";
    }
    return workMode;
}
function normalizeEmploymentType(employmentType) {
    if (!employmentType)
        return null;
    const value = employmentType.toLowerCase();
    if (value.includes("intern"))
        return "Internship";
    if (value.includes("full") ||
        value.includes("full-time") ||
        value.includes("full time")) {
        return "Full-Time";
    }
    if (value.includes("part") ||
        value.includes("part-time") ||
        value.includes("part time")) {
        return "Part-Time";
    }
    if (value.includes("contract"))
        return "Contract";
    if (value.includes("freelance"))
        return "Freelance";
    return employmentType;
}
