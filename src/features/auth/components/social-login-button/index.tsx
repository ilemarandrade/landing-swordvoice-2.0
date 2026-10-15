// Listo para la feature 1 (roadmap): se monta en LoginForm cuando exista el
// proveedor de autenticación. Hoy no se renderiza en ninguna vista.
type SocialProvider = "google" | "github";

type SocialLoginButtonProps = {
  provider: SocialProvider;
  onClick: () => void;
  disabled?: boolean;
};

const labels: Record<SocialProvider, string> = {
  google: "Continuar con Google",
  github: "Continuar con GitHub",
};

const iconPaths: Record<SocialProvider, string> = {
  google:
    "M21.8 10.2H12v3.9h5.6c-.5 2.5-2.7 4.1-5.6 4.1a6.2 6.2 0 1 1 4-10.9l2.8-2.8A10 10 0 1 0 22 12c0-.6-.1-1.2-.2-1.8z",
  github:
    "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
};

export function SocialLoginButton({
  provider,
  onClick,
  disabled,
}: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full border-2 border-white/35 bg-transparent font-semibold text-white hover:border-primary disabled:opacity-60"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={iconPaths[provider]} />
      </svg>
      {labels[provider]}
    </button>
  );
}
