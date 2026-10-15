import { ButtonLink } from "@/common/components/button-link";
import { routes } from "@/common/constants/routes";

type RecoverEmailSentProps = { onResend: () => void };

export function RecoverEmailSent({ onResend }: RecoverEmailSentProps) {
  return (
    <>
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-primary text-primary">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>
      <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
        Revisa tu <span className="text-secondary">correo</span>
      </h1>
      <p role="status" className="text-[17px] leading-relaxed text-[#E6E6EE]">
        Si existe una cuenta con ese correo, recibirás un enlace en unos
        minutos.
      </p>
      <div className="flex flex-col items-center gap-3.5">
        <ButtonLink href={routes.LOGIN} label="Volver a iniciar sesión" />
        <button
          type="button"
          onClick={onResend}
          className="min-h-11 text-sm font-bold tracking-wide text-primary hover:text-[#FFA34D]"
        >
          ¿NO LLEGÓ? REENVIAR
        </button>
      </div>
    </>
  );
}
