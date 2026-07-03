import { Request,Response } from "express";
import { parseDocument } from "../utils/documentParser";
import { extractSections } from "../utils/extractSections";
import { parseResume } from "../services/resume-service";
import { AIError } from "../utils/errors"; 

export async function resumeParserController(
    req: Request,
    res: Response
) {
    try {
        const document = await parseDocument(
            req.body.resumeText,
            req.file as any
        );

        const sections = extractSections(
            document.text
        );

        const result = await parseResume(
            document.text,
            sections,
            document.links
        );

        return res.json(result);
    } catch (err) {
        if (err instanceof AIError) {
            return res.status(err.statusCode).json({
                success: false,
                code: err.code,
                message: err.message
            });
        }

        console.error(err);

        return res.status(500).json({
            success: false,
            code: "AI_ERROR",
            message: "Something went wrong."
        });
    }
}