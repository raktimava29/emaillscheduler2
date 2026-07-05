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

            <p className="mt-2 text-gray-500">
                Upload your latest resume in PDF format.
            </p>

            <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-12 transition hover:border-emerald-500">
                <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) =>
                        onFileChange(e.target.files?.[0] ?? null)
                    }
                />

                <span className="text-lg font-medium">
                    {file ? file.name : "Choose Resume"}
                </span>

                <span className="mt-2 text-sm text-gray-500">
                    PDF only
                </span>
            </label>

            <div className="mt-8 flex justify-end">
                <button
                    disabled={!file}
                    onClick={onContinue}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Continue
                </button>
            </div>
        </>
    );
}