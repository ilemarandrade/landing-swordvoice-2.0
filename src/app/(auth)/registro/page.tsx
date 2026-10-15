import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import {
  AuthCard,
  AuthIntro,
  RegisterBenefits,
  RegisterForm,
} from "@/features/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
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
