import type { Role } from "../types/job";

interface RoleSelectorProps {
    roles: Role[];
    selectedRole: Role | null;
    onSelect: (role: Role) => void;
    onContinue: () => void;
    onBack: () => void;
}

export default function RoleSelector({
    roles,
    selectedRole,
    onSelect,
    onBack,
    onContinue,
}: RoleSelectorProps) {
    return (
        <>
            <h2 className="text-2xl font-bold">
                Select Position
            </h2>

            <p className="mt-2 text-gray-500">
                Multiple roles were detected. Choose the role you want to apply for.
            </p>

            <div className="mt-8 space-y-3">
                {roles.map((role) => (
                    <button
                        key={`${role.title}-${role.employmentType ?? ""}-${role.location ?? ""}`}
                        onClick={() => onSelect(role)}
                        className={`w-full rounded-xl border p-4 text-left transition
                        ${
                            selectedRole?.title === role.title
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-300 hover:border-emerald-400"
                        }`}
                    >
                        <p className="font-semibold text-lg">
                            {role.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {[
                                role.location,
                                role.workMode,
                                role.employmentType,
                            ]
                                .filter(Boolean)
                                .join(" • ")}
                        </p>

                        {role.experienceRequired && (
                            <p className="mt-2 text-sm text-gray-600">
                                Experience: {role.experienceRequired}
                            </p>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="rounded-xl border px-6 py-3"
                >
                    Back
                </button>

                <button
                    disabled={!selectedRole}
                    onClick={onContinue}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-white disabled:opacity-40"
                >
                    Continue
                </button>
            </div>
        </>
    );
}