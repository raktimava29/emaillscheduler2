import { Request, Response } from "express";
import { parseDocument } from "../utils/documentParser";
import { parseJob } from "../services/jobParser-service";
import { AIError } from "../utils/errors";

export async function jobParserController(
    req: Request,
    res: Response
) {
    try {
        const document = await parseDocument(
            req.body.jobText,
            req.file as any
        );

        const result = await parseJob(document.text);

        res.json(result);
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
            message: "Something went wrong."
        });
    }
}