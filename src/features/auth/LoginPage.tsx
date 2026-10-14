import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <>
      <AuthIntro
        title={
          <>
            Vuelve a tu <span className="text-primary">path</span>,{" "}
            <span className="text-secondary">Swordvoice</span>
          </>
        }
        description="Tu mentor, tu plan y tu progreso te están esperando. Entra y continúa donde lo dejaste."
      />
      <AuthCard
        title="Iniciar sesión"
        subtitle={
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link
              href={routes.REGISTER}
              className="font-bold text-primary hover:text-[#FFA34D]"
            >
              Regístrate
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthCard>
    </>
  );
}
