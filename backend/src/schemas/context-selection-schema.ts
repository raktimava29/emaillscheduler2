import { z } from "zod";

export const ContextSelectionSchema = z.object({
    candidateName: z.string().nullable(),
    company: z.string().nullable(),
    selectedRole: z.string().nullable(),
    location: z.string().nullable(),
    workMode: z.string().nullable(),
    employmentType: z.string().nullable(),
    joiningPreference: z.string().nullable(),
    matchingSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    relevantProjects: z.array(z.string()),
    relevantExperience: z.array(z.string()),
    education: z.array(z.string()),
    achievements: z.array(z.string()),
    keywords: z.array(z.string()),
    confidenceScore: z.number().min(0).max(1),
});

export type ContextSelection = z.infer<typeof ContextSelectionSchema>;