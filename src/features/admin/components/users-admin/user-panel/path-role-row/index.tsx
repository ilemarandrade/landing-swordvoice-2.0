import {
  pathRoleLabels,
  type PathRoleType,
} from "@/features/admin/constants/pathRoleLabels";

type PathRoleRowProps = {
  pathName: string;
  currentRole: PathRoleType | null;
  disabled: boolean;
  onChange: (role: PathRoleType | null) => void;
};

const OPTIONS: { role: PathRoleType | null; label: string }[] = [
  { role: null, label: "Sin rol" },
  { role: "APPRENTICE", label: pathRoleLabels.APPRENTICE },
  { role: "MENTOR", label: pathRoleLabels.MENTOR },
];

export function PathRoleRow({
  pathName,
  currentRole,
  disabled,
  onChange,
}: PathRoleRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 py-4 last:border-0">
      <span className="font-semibold">{pathName}</span>
      <div
        role="group"
        aria-label={`Rol en ${pathName}`}
        className="flex flex-wrap gap-2"
      >
        {OPTIONS.map(({ role, label }) => {
          const isCurrent = role === currentRole;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={isCurrent}
              disabled={disabled}
              onClick={() => {
                if (!isCurrent) onChange(role);
              }}
              className={`min-h-11 rounded-full border-2 px-4 text-sm font-semibold disabled:opacity-60 ${
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
    </div>
  );
}
