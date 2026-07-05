import { z } from "zod";
import { EducationSchema, ExperienceSchema, ProjectSchema } from "./resume-schema";
import { RoleSchema } from "./jobParser-schema";

export const SkillMatchSchema = z.object({
    jobSkill: z.string(),
    resumeSkill: z.string(),
});

export const CandidateContextSchema = z.object({
    candidateName: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),

    links: z.array(
        z.object({
            label: z.string().nullable().optional(),
            url: z.string(),
        })
    ),

    contactName: z.string().nullable(),
    company: z.string().nullable(),
    selectedRole: RoleSchema.nullable(),
    joiningPreference: z.string().nullable(),

    matchingSkills: z.array(SkillMatchSchema),
    missingSkills: z.array(z.string()),

    relevantProjects: z.array(ProjectSchema),
    relevantExperience: z.array(ExperienceSchema),
    education: z.array(EducationSchema),

    achievements: z.array(z.string()),
    keywords: z.array(z.string()),

    confidenceScore: z.number().min(0).max(1),
});

export type CandidateContext = z.infer<typeof CandidateContextSchema>;