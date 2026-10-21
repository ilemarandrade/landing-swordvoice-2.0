import { academyRoleSchema, type AcademyRole } from "@/common/api/auth.schema";
import { academyRoleLabels } from "@/common/constants/academyRoleLabels";

type RoleFilterProps = {
  value: AcademyRole | null;
  onChange: (academyRole: AcademyRole | null) => void;
};

const OPTIONS: { role: AcademyRole | null; label: string }[] = [
  { role: null, label: "Todos" },
  ...academyRoleSchema.options.map((role) => ({
    role,
    label: academyRoleLabels[role],
  })),
];

export function RoleFilter({ value, onChange }: RoleFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por rol"
      className="flex flex-wrap gap-2"
    >
      {OPTIONS.map(({ role, label }) => {
        const isCurrent = role === value;
        return (
          <button
            key={role ?? "ALL"}
            type="button"
            aria-pressed={isCurrent}
            onClick={() => {
              if (!isCurrent) onChange(role);
            }}
            className={`min-h-11 rounded-full border-2 px-4 text-sm font-semibold ${
              isCurrent
                ? "border-primary bg-primary/[0.12] text-primary"
                : "border-white/35 hover:border-primary"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
