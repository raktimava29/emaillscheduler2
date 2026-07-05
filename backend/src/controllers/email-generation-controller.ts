import { Request, Response } from "express";
import { generateEmail } from "../services/email-service";
import { CandidateContextSchema } from "../schemas/candidate-selection-schema";
import { AIError } from "../utils/errors";

export async function emailGenerationController(
    req: Request,
    res: Response
) {
    try {
        const context = CandidateContextSchema.parse(req.body);

        const email = await generateEmail(context);

        return res.json(email);
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