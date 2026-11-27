import { FiSend } from "react-icons/fi";

interface LoadingScreenProps {
    title: string;
    description: string;
}

export default function LoadingScreen({
    title,
    description
}: LoadingScreenProps) {
    return (
        <div role="status" className="flex flex-col items-center py-14 text-center">
            <span aria-hidden className="mb-8 flex h-20 w-20 animate-hover items-center justify-center rounded-3xl bg-sun text-ink shadow-lg">
                <FiSend size={34} />
            </span>

            <h2 className="text-2xl font-bold">
                {title}
            </h2>

            <p className="mt-3 text-slate2">
                {description}
            </p>
        </div>
    );
}
