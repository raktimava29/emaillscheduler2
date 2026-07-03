import { Request, Response } from "express";
import { parseDocument } from "../utils/documentParser";
import { extractSections } from "../utils/extractSections";
import { parseResume } from "../services/resume-service";
import { parseJob } from "../services/jobParser-service";
import { buildCandidateContext } from "../services/context-service";
import { AIError } from "../utils/errors";

export async function contextController(
    req: Request,
    res: Response
) {
    try {

        const files = req.files as {
            resumeFile?: Express.Multer.File[];
            jobFile?: Express.Multer.File[];
        };

        const resumeDocument = await parseDocument(
            req.body.resumeText,
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
            req.body.jobText,
            files?.jobFile?.[0]
        );

        const job = await parseJob(
            jobDocument.text
        );

        const context = await buildCandidateContext(
            resume,
            job
        );

        return res.json(context);

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