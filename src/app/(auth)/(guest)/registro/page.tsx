import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/common/constants/routes";
import {
  AuthCard,
  AuthIntro,
  OAuthButtons,
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
            Crea tu <span className="text-primary">cuenta</span> y{" "}
            <span className="text-secondary">empieza</span>
          </>
        }
        description={
          <>
            Crea tu cuenta y, al activar tu membresía, te asignamos un{" "}
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
        <OAuthButtons />
        <RegisterForm />
      </AuthCard>
    </>
  );
}
