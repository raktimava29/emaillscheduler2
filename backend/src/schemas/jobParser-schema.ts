import { z } from "zod";

export const RoleSchema = z.object({
  title: z.string().min(1),
  location: z.string().nullable(),
  workMode: z.string().nullable(),
  employmentType: z.string().nullable(),
  experienceRequired: z.string().nullable(),
  salary: z.string().nullable(),
});

export const JobParserResponseSchema = z.object({
  recipientEmail: z.string().email().nullable(),
  company: z.string().nullable(),
  roles: z.array(RoleSchema).min(1),
  selectedRole: RoleSchema.nullable(),
  contactName: z.string().nullable(),
  joiningPreference: z.string().nullable(),
  skills: z.array(z.string()),
  applicationDeadline: z.string().nullable(),
  jobLink: z.string().nullable(),
  keywords: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export type Role = z.infer<typeof RoleSchema>;
export type JobParserResponse = z.infer<typeof JobParserResponseSchema>;