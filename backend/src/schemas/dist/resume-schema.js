"use strict";
exports.__esModule = true;
exports.ResumeParserResponseSchema = exports.ExperienceSchema = exports.EducationSchema = exports.ProjectSchema = void 0;
var zod_1 = require("zod");
exports.ProjectSchema = zod_1.z.object({
    name: zod_1.z.string(),
    technologies: zod_1.z.array(zod_1.z.string()),
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
    description: zod_1.z.array(zod_1.z.string())
});
exports.EducationSchema = zod_1.z.object({
    degree: zod_1.z.string(),
    institution: zod_1.z.string(),
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
    academicScore: zod_1.z.object({
        gpa: zod_1.z.coerce.number().nullable().optional(),
        cgpa: zod_1.z.coerce.number().nullable().optional(),
        sgpa: zod_1.z.coerce.number().nullable().optional(),
        percentage: zod_1.z.coerce.number().nullable().optional()
    }).nullable().optional(),
    location: zod_1.z.string().nullable().optional()
});
exports.ExperienceSchema = zod_1.z.object({
    position: zod_1.z.string().nullable().optional(),
    company: zod_1.z.string().nullable().optional(),
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
    location: zod_1.z.string().nullable().optional(),
    description: zod_1.z.array(zod_1.z.string())
});
exports.ResumeParserResponseSchema = zod_1.z.object({
    name: zod_1.z.string().nullable(),
    headline: zod_1.z.string().nullable(),
    summary: zod_1.z.string().nullable(),
    education: zod_1.z.array(exports.EducationSchema),
    experience: zod_1.z.array(exports.ExperienceSchema),
    projects: zod_1.z.array(exports.ProjectSchema),
    skills: zod_1.z.array(zod_1.z.string()),
    certifications: zod_1.z.array(zod_1.z.string()),
    achievements: zod_1.z.array(zod_1.z.string()),
    links: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().nullable().optional(),
        url: zod_1.z.string()
    })),
    confidenceScore: zod_1.z.number().min(0).max(1)
});
