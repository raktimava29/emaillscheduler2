"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateContextSchema = void 0;
const zod_1 = require("zod");
const resume_schema_1 = require("./resume-schema");
exports.CandidateContextSchema = zod_1.z.object({
    candidateName: zod_1.z.string().nullable(),
    phone: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    links: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().nullable().optional(),
        url: zod_1.z.string(),
    })),
    contactName: zod_1.z.string().nullable(),
    company: zod_1.z.string().nullable(),
    selectedRole: zod_1.z.string().nullable(),
    location: zod_1.z.string().nullable(),
    workMode: zod_1.z.string().nullable(),
    employmentType: zod_1.z.string().nullable(),
    joiningPreference: zod_1.z.string().nullable(),
    matchingSkills: zod_1.z.array(zod_1.z.string()),
    missingSkills: zod_1.z.array(zod_1.z.string()),
    relevantProjects: zod_1.z.array(resume_schema_1.ProjectSchema),
    relevantExperience: zod_1.z.array(resume_schema_1.ExperienceSchema),
    education: zod_1.z.array(resume_schema_1.EducationSchema),
    achievements: zod_1.z.array(zod_1.z.string()),
    keywords: zod_1.z.array(zod_1.z.string()),
    confidenceScore: zod_1.z.number().min(0).max(1),
});
