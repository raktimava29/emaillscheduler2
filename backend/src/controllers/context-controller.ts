import { Request, Response} from "express";
import { buildCandidateContext } from "../services/context-service";
import { AIError } from "../utils/errors";

export async function contextController(
    req: Request,
    res: Response
) {
    try {
        const {resume, job, selectedRole} = req.body;

        const context = await buildCandidateContext(resume, job, selectedRole);

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
            message: "Something went wrong."
        });
    }
}