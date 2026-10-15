import { ButtonLink } from "@/common/components/button-link";
import { Typography } from "@/common/components/typography";
import { routes } from "@/common/constants/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-center text-white">
      <Typography as="h1" variant="h3" className="font-sedgwick">
        Esta página no existe
      </Typography>
      <Typography>Revisa la dirección o vuelve al inicio.</Typography>
      <ButtonLink href={routes.HOME} label="Volver al inicio" />
    </main>
  );
}
