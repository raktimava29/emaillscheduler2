"use strict";
exports.__esModule = true;
exports.ContextSelectionSchema = void 0;
var zod_1 = require("zod");
exports.ContextSelectionSchema = zod_1.z.object({
    candidateName: zod_1.z.string().nullable(),
    company: zod_1.z.string().nullable(),
    selectedRole: zod_1.z.string().nullable(),
    location: zod_1.z.string().nullable(),
    workMode: zod_1.z.string().nullable(),
    employmentType: zod_1.z.string().nullable(),
    joiningPreference: zod_1.z.string().nullable(),
    matchingSkills: zod_1.z.array(zod_1.z.string()),
    missingSkills: zod_1.z.array(zod_1.z.string()),
    relevantProjects: zod_1.z.array(zod_1.z.string()),
    relevantExperience: zod_1.z.array(zod_1.z.string()),
    education: zod_1.z.array(zod_1.z.string()),
    achievements: zod_1.z.array(zod_1.z.string()),
    keywords: zod_1.z.array(zod_1.z.string()),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
