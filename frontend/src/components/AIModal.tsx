import { useCallback, useEffect, useState } from "react";
import type { AIStep } from "../types/ai-step";
import ResumeUpload from "./ResumeUpload";
import JobUpload from "./JobUpload";
import LoadingScreen from "./LoadingScreen";
import RoleSelector from "./RoleSelector";
import { parseDocuments, buildContext, generateEmail } from "../lib/ai";
import type { ResumeParserResponse } from "../types/resume";
import type { JobParserResponse } from "../types/job";

interface AIModalProps {
    open: boolean;
    onClose: () => void;
    onGenerated: (email: {
        recipient: string | null;
        subject: string;
        body: string;
        resumeFile: File;
    }) => void;
}

export default function AIModal({
    open,
    onClose,
    onGenerated
}: AIModalProps) {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobFile, setJobFile] = useState<File | null>(null);
    const [jobText, setJobText] = useState("");

    const [step, setStep] = useState<AIStep>("UPLOAD_RESUME");

    const [resume, setResume] = useState<ResumeParserResponse | null>(null);
    const [job, setJob] = useState<JobParserResponse | null>(null);

    const resetModal = useCallback(() => {
        setStep("UPLOAD_RESUME");

        setResumeFile(null);
        setJobFile(null);
        setJobText("");

        setResume(null);
        setJob(null);
    }, []);

    const handleClose = useCallback(() => {
        resetModal();
        onClose();
    }, [resetModal, onClose]);

    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [open, handleClose]);

    const handleBuildContext = async (
        resume: ResumeParserResponse,
        job: JobParserResponse
    ) => {
        setStep("BUILDING_CONTEXT");

        try {
            const candidateContext = await buildContext(resume, job);

            setStep("GENERATING_EMAIL");

            const email = await generateEmail(candidateContext);

            onGenerated({
                recipient: job.recipientEmail,
                subject: email.subject,
                body: email.body,
                resumeFile: resumeFile!
            });

            handleClose();
        } catch (err) {
            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to build candidate context."
            );

            setStep("ROLE_SELECTION");
        }
    };

    const handleParse = async () => {
        if (!resumeFile) return;

        if (!jobFile && !jobText.trim()) return;

        try {
            setStep("PARSING");

            const data = await parseDocuments(
                resumeFile,
                jobFile ?? undefined,
                jobText
            );

            setResume(data.resume);

            if (data.job.roles.length > 1) {
                setJob(data.job);
                setStep("ROLE_SELECTION");
            } else {
                const updatedJob: JobParserResponse = {
                    ...data.job,
                    selectedRole: data.job.roles[0],
                };

                setJob(updatedJob);

                await handleBuildContext(data.resume, updatedJob);
            }

        } catch (err) {
            console.error(err);

            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to parse documents."
            );

            setStep("UPLOAD_JOB");
        }
    };

    if (!open) return null;

    let content;

    switch (step) {
        case "UPLOAD_RESUME":
            content = (
                <ResumeUpload
                    file={resumeFile}
                    onFileChange={setResumeFile}
                    onContinue={() => setStep("UPLOAD_JOB")}
                />
            );
            break;

        case "UPLOAD_JOB":
            content = (
                <JobUpload
                    jobFile={jobFile}
                    jobText={jobText}
                    onFileChange={setJobFile}
                    onTextChange={setJobText}
                    onBack={() => setStep("UPLOAD_RESUME")}
                    onContinue={handleParse}
                />
            );
            break;

        case "PARSING":
            content = (
                <LoadingScreen
                    title="Parsing Documents"
                    description="Analyzing your resume and job description..."
                />
            );
            break;

        case "ROLE_SELECTION":
            content = (
                <RoleSelector
                    roles={job?.roles ?? []}
                    selectedRole={job?.selectedRole ?? null}
                    onSelect={(role) => {
                        if (!job) return;

                        setJob({
                            ...job,
                            selectedRole: role,
                        });
                    }}
                    onBack={() => setStep("UPLOAD_JOB")}
                    onContinue={async () => {
                        if (!resume || !job?.selectedRole) return;

                        await handleBuildContext(resume, job);
                    }}
                />
            );
            break;

        case "BUILDING_CONTEXT":
            content = (
                <LoadingScreen
                    title="Building Candidate Context"
                    description="Matching your resume with the selected role..."
                />
            );
            break;

        case "GENERATING_EMAIL":
            content = (
                <LoadingScreen
                    title="Generating Email"
                    description="Writing a personalized application email..."
                />
            );
            break;

        default:
            content = null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl"
            >
                <button
                    onClick={handleClose}
                    className="absolute right-5 top-5 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Close AI Assistant"
                >
                    ✕
                </button>

                <div className="p-8">
                    {content}
                </div>
            </div>
        </div>
    );
}