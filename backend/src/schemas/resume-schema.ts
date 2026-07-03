import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string(),
  technologies: z.array(z.string()),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.array(z.string()),
});

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  academicScore: z.object({
    gpa: z.coerce.number().nullable().optional(),
    cgpa: z.coerce.number().nullable().optional(),
    sgpa: z.coerce.number().nullable().optional(),
    percentage: z.coerce.number().nullable().optional(),
  }).nullable().optional(),
  location: z.string().nullable().optional(),
});

export const ExperienceSchema = z.object({
  position: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.array(z.string()),
});

export const ResumeParserResponseSchema = z.object({
  name: z.string().nullable(),
  headline: z.string().nullable(),
  summary: z.string().nullable(),
  education: z.array(EducationSchema),
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  achievements: z.array(z.string()),
  links: z.array(
    z.object({
      label: z.string().nullable().optional(),
      url: z.string(),
    })
  ),
  confidenceScore: z.number().min(0).max(1),
});

export type ResumeParserResponse = z.infer<typeof ResumeParserResponseSchema>;