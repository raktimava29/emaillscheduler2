import { Request, Response } from "express";
import { parseDocument } from "../utils/documentParser";
import { parseResume } from "../services/resume-service";
import { parseJob } from "../services/jobParser-service";
import { extractSections } from "../utils/extractSections";
import { AIError } from "../utils/errors";

export async function parseController(
    req: Request,
    res: Response
) {
    try {
        const files = req.files as {
            resumeFile?: Express.Multer.File[];
            jobFile?: Express.Multer.File[];
        };

        const hasResume =
            Boolean(req.body.resumeFile?.trim()) ||
            Boolean(files?.resumeFile?.[0]);

        const hasJob =
            Boolean(req.body.jobFile?.trim()) ||
            Boolean(files?.jobFile?.[0]);

        if (!hasResume) {
            throw new AIError(
                "MISSING_RESUME",
                "Provide either resumeFile as text or upload a resume file.",
                400
            );
        }

        if (!hasJob) {
            throw new AIError(
                "MISSING_JOB",
                "Provide either jobFile as text or upload a job file.",
                400
            );
        }

        const resumeDocument = await parseDocument(
            req.body.resumeFile,
            files?.resumeFile?.[0]
        );

        const resumeSections = extractSections(
            resumeDocument.text
        );

        const resume = await parseResume(
            resumeDocument.text,
            resumeSections,
            resumeDocument.links
        );

        const jobDocument = await parseDocument(
            req.body.jobFile,
            files?.jobFile?.[0]
        );

        const job = await parseJob(
            jobDocument.text
        );

        return res.json({
            resume,
            job,
        });

    } catch (err) {

        if (err instanceof AIError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message,
            });
        }

        console.error(err);

        return res.status(500).json({
            success: false,
            code: "AI_ERROR",
            message: "Something went wrong.",
        });
    }
}