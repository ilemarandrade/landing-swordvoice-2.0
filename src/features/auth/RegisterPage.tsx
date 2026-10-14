import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthIntro } from "@/features/auth/components/auth-intro";
import { RegisterBenefits } from "@/features/auth/components/register-benefits";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <>
      <AuthIntro
        title={
          <>
            Elige tu <span className="text-primary">path</span> y{" "}
            <span className="text-secondary">empieza</span>
          </>
        }
        description={
          <>
            Crea tu cuenta, elige tu ruta y te asignamos un{" "}
            <strong>MENTOR</strong> con el plan exacto que debes seguir.
          </>
        }
      >
        <RegisterBenefits />
      </AuthIntro>
      <AuthCard
        title="Crear cuenta"
        subtitle={
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href={routes.LOGIN}
              className="font-bold text-primary hover:text-[#FFA34D]"
            >
              Inicia sesión
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthCard>
    </>
  );
}
