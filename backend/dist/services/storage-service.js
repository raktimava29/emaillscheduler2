"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = uploadResume;
exports.downloadResume = downloadResume;
exports.deleteResume = deleteResume;
const crypto_1 = require("crypto");
const supabase_1 = require("../config/supabase");
const BUCKET = process.env.SUPABASE_RESUME_BUCKET;
if (!BUCKET) {
    throw new Error("SUPABASE_RESUME_BUCKET is not configured.");
}
async function uploadResume(file) {
    const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `resumes/${(0, crypto_1.randomUUID)()}.${extension}`;
    const { error } = await supabase_1.supabase.storage
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
async function downloadResume(path) {
    const { data, error } = await supabase_1.supabase.storage
        .from(BUCKET)
        .download(path);
    if (error || !data) {
        throw new Error(`Resume download failed: ${error?.message}`);
    }
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
async function deleteResume(path) {
    const { error } = await supabase_1.supabase.storage
        .from(BUCKET)
        .remove([path]);
    if (error) {
        throw new Error(`Resume delete failed: ${error.message}`);
    }
}
