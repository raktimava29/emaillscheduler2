import FileDrop from "./ui/FileDrop";

interface ResumeUploadProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    onContinue: () => void;
}

export default function ResumeUpload({
    file,
    onFileChange,
    onContinue,
}: ResumeUploadProps) {
    return (
        <>
            <h2 className="text-2xl font-bold">
                Upload Resume
            </h2>

            <p className="mt-2 text-slate2">
                Upload your latest resume in PDF format.
            </p>

            <FileDrop file={file} prompt="Choose resume" onFile={onFileChange} />

            <div className="mt-8 flex justify-end">
                <button
                    disabled={!file}
                    onClick={onContinue}
                    className="btn-primary"
                >
                    Continue
                </button>
            </div>
        </>
    );
}