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

            <p className="mt-2 text-gray-500">
                Upload a PDF or paste the job description below.
            </p>

            <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-10 transition hover:border-emerald-500">
                <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        onFileChange(file);

                        if (file) {
                            onTextChange("");
                        }
                    }}
                />

                <span>
                    {jobFile ? jobFile.name : "Upload PDF"}
                </span>
            </label>

            <div className="my-6 text-center text-gray-400">
                OR
            </div>

            <textarea
                value={jobText}
                rows={10}
                placeholder="Paste the job description here..."
                className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-emerald-500"
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
                    className="rounded-xl border border-gray-300 px-6 py-3 transition hover:bg-gray-50"
                >
                    Back
                </button>

                <button
                    disabled={!jobFile && jobText.trim() === ""}
                    onClick={onContinue}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Parse
                </button>
            </div>
        </>
    );
}