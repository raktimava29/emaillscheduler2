import { z } from "zod";

export const EmailSchema = z.object({
    subject: z.string().trim().min(1),
    body: z.string().trim().min(1),
    confidenceScore: z.number().min(0).max(1),
});

export type EmailResponse = z.infer<typeof EmailSchema>;