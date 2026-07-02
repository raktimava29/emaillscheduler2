import { z } from "zod";

export const JobParserResponseSchema = z.object({
  recipientEmail: z.string().email().nullable(),
  company: z.string().nullable(),
  jobTitles: z.array(z.string()),
  selectedJobTitle: z.string().nullable(),
  contactName: z.string().nullable(),
  location: z.string().nullable(),
  joiningPreference: z.string().nullable(),
  workMode: z.string().nullable(),
  employmentType: z.string().nullable(),
  experienceRequired: z.string().nullable(),
  salary: z.string().nullable(),
  skills: z.array(z.string()),
  applicationDeadline: z.string().nullable(),
  jobLink: z.string().nullable(),
  keywords: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export type JobParserResponse = z.infer<typeof JobParserResponseSchema>;