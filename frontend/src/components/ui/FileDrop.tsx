import { useState } from "react";
import { FiFileText, FiUploadCloud } from "react-icons/fi";

interface FileDropProps {
    file: File | null;
    prompt: string;
    onFile: (file: File | null) => void;
}

export default function FileDrop({ file, prompt, onFile }: FileDropProps) {
    const [dragging, setDragging] = useState(false);
    const Icon = file ? FiFileText : FiUploadCloud;

    return (
        <label
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files?.[0];
                // Same restriction as the picker's accept=".pdf".
                if (dropped?.name.toLowerCase().endsWith(".pdf")) onFile(dropped);
            }}
            className={`group mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-8 text-center transition focus-within:border-cobalt focus-within:ring-4 focus-within:ring-cobalt/20 ${
                dragging ? "scale-[1.02] border-cobalt bg-sky" : file ? "border-mint bg-mint-light" : "border-line hover:border-cobalt hover:bg-sky/50"
            }`}
        >
            <input
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <Icon aria-hidden size={32} className={`transition group-hover:-translate-y-1 ${file ? "text-mint" : "text-cobalt"}`} />
            <span className="mt-3 max-w-full break-all font-semibold">{file ? file.name : prompt}</span>
            <span className="mt-1 text-sm text-slate2">{file ? "Click or drop to replace" : "Drop a PDF here, or click to browse"}</span>
        </label>
    );
}
