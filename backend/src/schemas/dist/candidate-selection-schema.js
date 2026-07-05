"use strict";
exports.__esModule = true;
exports.CandidateContextSchema = exports.SkillMatchSchema = void 0;
var zod_1 = require("zod");
var resume_schema_1 = require("./resume-schema");
var jobParser_schema_1 = require("./jobParser-schema");
exports.SkillMatchSchema = zod_1.z.object({
    jobSkill: zod_1.z.string(),
    resumeSkill: zod_1.z.string()
});
exports.CandidateContextSchema = zod_1.z.object({
    candidateName: zod_1.z.string().nullable(),
    phone: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    links: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().nullable().optional(),
        url: zod_1.z.string()
    })),
    contactName: zod_1.z.string().nullable(),
    company: zod_1.z.string().nullable(),
    selectedRole: jobParser_schema_1.RoleSchema.nullable(),
    joiningPreference: zod_1.z.string().nullable(),
    matchingSkills: zod_1.z.array(exports.SkillMatchSchema),
    missingSkills: zod_1.z.array(zod_1.z.string()),
    relevantProjects: zod_1.z.array(resume_schema_1.ProjectSchema),
    relevantExperience: zod_1.z.array(resume_schema_1.ExperienceSchema),
    education: zod_1.z.array(resume_schema_1.EducationSchema),
    achievements: zod_1.z.array(zod_1.z.string()),
    keywords: zod_1.z.array(zod_1.z.string()),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
