"use strict";
exports.__esModule = true;
exports.JobParserResponseSchema = void 0;
var zod_1 = require("zod");
exports.JobParserResponseSchema = zod_1.z.object({
    recipientEmail: zod_1.z.string().email().nullable(),
    company: zod_1.z.string().nullable(),
    jobTitles: zod_1.z.array(zod_1.z.string()),
    selectedJobTitle: zod_1.z.string().nullable(),
    contactName: zod_1.z.string().nullable(),
    location: zod_1.z.string().nullable(),
    joiningPreference: zod_1.z.string().nullable(),
    workMode: zod_1.z.string().nullable(),
    employmentType: zod_1.z.string().nullable(),
    experienceRequired: zod_1.z.string().nullable(),
    salary: zod_1.z.string().nullable(),
    skills: zod_1.z.array(zod_1.z.string()),
    applicationDeadline: zod_1.z.string().nullable(),
    jobLink: zod_1.z.string().nullable(),
    keywords: zod_1.z.array(zod_1.z.string()),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
