import { useCallback, useEffect, useState } from "react";
import type { AIStep } from "../types/ai-step";
import ResumeUpload from "./ResumeUpload";
import JobUpload from "./JobUpload";
import LoadingScreen from "./LoadingScreen";
import RoleSelector from "./RoleSelector";
import { parseDocuments, buildContext, generateEmail } from "../lib/ai";
import { FiX } from "react-icons/fi";
import { useToast } from "./ui/toast-context";
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
    const toast = useToast();
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

            toast(
                err instanceof Error
                    ? err.message
                    : "Failed to build candidate context.",
                "error"
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

            toast(
                err instanceof Error
                    ? err.message
                    : "Failed to parse documents.",
                "error"
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

    const progress =
        step === "UPLOAD_RESUME" ? 0
        : step === "UPLOAD_JOB" || step === "PARSING" ? 1
        : step === "ROLE_SELECTION" ? 2
        : 3;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Generate an email from a job description"
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-full w-full max-w-2xl animate-rise flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                <div className="airmail shrink-0" />

                <div className="flex items-center gap-4 px-6 pt-5 sm:px-8">
                    <ol className="grid flex-1 grid-cols-4 gap-2">
                        {["Resume", "Job", "Role", "Draft"].map((name, i) => (
                            <li key={name} aria-current={i === progress ? "step" : undefined} className={`text-xs font-semibold ${i <= progress ? "text-cobalt" : "text-slate2"}`}>
                                <span className={`mb-1.5 block h-1.5 rounded-full transition-colors duration-500 ${i <= progress ? "bg-cobalt" : "bg-sky"}`} />
                                {name}
                            </li>
                        ))}
                    </ol>
                    <button onClick={handleClose} className="icon-btn" aria-label="Close AI Assistant">
                        <FiX aria-hidden />
                    </button>
                </div>

                <div className="overflow-auto p-6 sm:p-8">
                    {content}
                </div>
            </div>
        </div>
    );
}
