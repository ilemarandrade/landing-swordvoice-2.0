type AuthTextButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function AuthTextButton({ label, onClick, disabled }: AuthTextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 text-sm font-bold tracking-wide text-primary hover:text-[#FFA34D] disabled:opacity-60"
    >
      {label}
    </button>
  );
}
