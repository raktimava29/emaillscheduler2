"use strict";
exports.__esModule = true;
exports.JobParserResponseSchema = exports.RoleSchema = void 0;
var zod_1 = require("zod");
exports.RoleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    location: zod_1.z.string().nullable(),
    workMode: zod_1.z.string().nullable(),
    employmentType: zod_1.z.string().nullable(),
    experienceRequired: zod_1.z.string().nullable(),
    salary: zod_1.z.string().nullable()
});
exports.JobParserResponseSchema = zod_1.z.object({
    recipientEmail: zod_1.z.string().email().nullable(),
    company: zod_1.z.string().nullable(),
    roles: zod_1.z.array(exports.RoleSchema).min(1),
    selectedRole: exports.RoleSchema.nullable(),
    contactName: zod_1.z.string().nullable(),
    joiningPreference: zod_1.z.string().nullable(),
    skills: zod_1.z.array(zod_1.z.string()),
    applicationDeadline: zod_1.z.string().nullable(),
    jobLink: zod_1.z.string().nullable(),
    keywords: zod_1.z.array(zod_1.z.string()),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
