import FileDrop from "./ui/FileDrop";

interface JobUploadProps {
    jobFile: File | null;
    jobText: string;

    onFileChange: (file: File | null) => void;
    onTextChange: (text: string) => void;

    onBack: () => void;
    onContinue: () => void;
}

export default function JobUpload({
    jobFile,
    jobText,
    onFileChange,
    onTextChange,
    onBack,
    onContinue,
}: JobUploadProps) {
    return (
        <>
            <h2 className="text-2xl font-bold">
                Job Description
            </h2>

            <p className="mt-2 text-slate2">
                Upload a PDF or paste the job description below.
            </p>

            <FileDrop
                file={jobFile}
                prompt="Upload job description"
                onFile={(file) => {
                    onFileChange(file);

                    if (file) {
                        onTextChange("");
                    }
                }}
            />

            <div className="my-4 text-center text-slate2">
                or paste it
            </div>

            <textarea
                value={jobText}
                rows={6}
                placeholder="Paste the job description here..."
                aria-label="Job description text"
                className="field"
                onChange={(e) => {
                    onTextChange(e.target.value);

                    if (e.target.value) {
                        onFileChange(null);
                    }
                }}
            />

            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="btn-ghost"
                >
                    Back
                </button>

                <button
                    disabled={!jobFile && jobText.trim() === ""}
                    onClick={onContinue}
                    className="btn-primary"
                >
                    Parse
                </button>
            </div>
        </>
    );
}