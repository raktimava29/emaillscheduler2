import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string(),
  technologies: z.array(z.string()),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  description: z.array(z.string()),
});

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  academicScore: z.object({
    gpa: z.coerce.number().nullable(),
    cgpa: z.coerce.number().nullable(),
    sgpa: z.coerce.number().nullable(),
    percentage: z.coerce.number().nullable(),
  }).nullable(),
  location: z.string().nullable(),
});

export const ExperienceSchema = z.object({
  position: z.string().nullable(),
  company: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  location: z.string().nullable(),
  description: z.array(z.string()),
});

export const ResumeParserResponseSchema = z.object({
  name: z.string().nullable(),
  phone: z.string().nullable(),
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
      label: z.string().nullable(),
      url: z.string(),
    })
  ),
  confidenceScore: z.number().min(0).max(1),
});

export type ResumeParserResponse = z.infer<typeof ResumeParserResponseSchema>;