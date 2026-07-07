import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";

const BUCKET = process.env.SUPABASE_RESUME_BUCKET!;

if (!BUCKET) {
    throw new Error("SUPABASE_RESUME_BUCKET is not configured.");
}

export async function uploadResume(
    file: Express.Multer.File
): Promise<{
    path: string;
    fileName: string;
    contentType: string
}> {
    const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "pdf";

    const path = `resumes/${randomUUID()}.${extension}`;

    const { error } = await supabase.storage
                                    .from(BUCKET)
                                    .upload(path, file.buffer, {
                                        contentType: file.mimetype,
                                        upsert: false
                                    });

    if (error) {
        throw new Error(`Resume upload failed: ${error.message}`);
    }

    return {
        path,
        fileName: file.originalname,
        contentType: file.mimetype
    };
}

export async function downloadResume(
    path: string
): Promise<Buffer> {
    const { data, error } = await supabase.storage
                                          .from(BUCKET)  
                                          .download(path);

    if (error || !data) {
        throw new Error(`Resume download failed: ${error?.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();

    return Buffer.from(arrayBuffer);
}

export async function deleteResume(
    path: string
): Promise<void> {
    const { error } = await supabase.storage
                                    .from(BUCKET)
                                    .remove([path]);

    if (error) {
        throw new Error(`Resume delete failed: ${error.message}`);
    }
}