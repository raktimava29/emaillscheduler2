interface LoadingScreenProps {
    title: string;
    description: string;
}

export default function LoadingScreen({
    title,
    description
}: LoadingScreenProps) {
    return (
        <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-8 h-14 w-14 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />

            <h2 className="text-2xl font-semibold">
                {title}
            </h2>

            <p className="mt-3 text-gray-500">
                {description}
            </p>
        </div>
    );
}