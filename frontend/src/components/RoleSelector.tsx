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

            <p className="mt-2 text-slate2">
                Multiple roles were detected. Choose the role you want to apply for.
            </p>

            <div className="mt-8 space-y-3">
                {roles.map((role) => (
                    <button
                        key={`${role.title}-${role.employmentType ?? ""}-${role.location ?? ""}`}
                        onClick={() => onSelect(role)}
                        aria-pressed={selectedRole?.title === role.title}
                        className={`w-full rounded-xl border p-4 text-left transition
                        ${
                            selectedRole?.title === role.title
                                ? "border-cobalt bg-sky ring-2 ring-cobalt"
                                : "border-line hover:border-cobalt"
                        }`}
                    >
                        <p className="font-semibold text-lg">
                            {role.title}
                        </p>

                        <p className="mt-1 text-sm text-slate2">
                            {[
                                role.location,
                                role.workMode,
                                role.employmentType,
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </p>

                        {role.experienceRequired && (
                            <p className="mt-2 text-sm text-slate2">
                                Experience: {role.experienceRequired}
                            </p>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="btn-ghost"
                >
                    Back
                </button>

                <button
                    disabled={!selectedRole}
                    onClick={onContinue}
                    className="btn-primary"
                >
                    Continue
                </button>
            </div>
        </>
    );
}