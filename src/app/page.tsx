import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import PathAvailable from "@/components/PathAvailable";
import Services from "@/components/Services";
import paths from "@/constants/paths";
import services from "@/constants/services";
import { useMemo } from "react";

export default function Home() {
  const pathAvailables = useMemo(
    () => paths.filter(({ isAvailable }) => isAvailable),
    [],
  );

  const pathNotAvailables = useMemo(
    () => paths.filter(({ isAvailable }) => !isAvailable),
    [],
  );

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      {/* First page */}
      <div className="min-h-screen bg-home w-full bg-cover bg-bottom bg-no-repeat border-b-2 border-b-[black] justify-center items-center flex flex-col">
        <div className="flex flex-col items-center bg-[#000e2799] w-[95%] py-2">
          <h1 className="text-title leading-[48px]">Swordvoice Academy</h1>
          <p className="text-base">
            <span className="font-bold">Academia online</span> no tradicional
          </p>
        </div>
        <Button label="Registrarme" />
      </div>
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Second Page */}
      <div className="px-32 min-h-screen bg-whatIsSwordvoices w-full bg-cover bg-bottom bg-no-repeat flex justify-end items-center">
        <div className="w-[45%]">
          <h1 className="text-title mb-8">
            ¿Qué es <br />
            <span className="text-primary">Swordvoice</span>
            <span className="text-secondary"> Academy</span>?
          </h1>
          <p className="text-lg mb-4">
            Hola, somos <span className="font-bold">Swordvoice academy</span> y
            si buscas cursos online tradicionales{" "}
            <span className="font-bold">NO</span> estás en el lugar correcto.
          </p>
          <p className="text-lg">
            Nosotros ofrecemos un modelo diferente, un modelo de mentorías.
            Sabemos que la informacion está disponible en la Web, pero{" "}
            <span className="font-bold">¿por dónde empezar?</span>. Tu{" "}
            <span className="font-bold">MENTOR</span> asignado te proveerá de
            los recursos y el plan que debes seguir para que no pierdas tiempo.
          </p>
        </div>
      </div>
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Third Page */}
      <div className="min-h-screen bg-[black] w-full px-[100px] pb-12 pt-20">
        <div className="grid grid-cols-2 gap-x-12 ">
          <div className="relative">
            <h1 className="text-title mb-12 absolute top-[-32px]">
              ¿Qué incluye <br />
              <span className="text-secondary">nuestro servicio?</span>
            </h1>
          </div>
          {services.map(({ title, description, Icon }, index) => (
            <Services
              title={title}
              description={description}
              icon={<Icon />}
              key={`services-${index}`}
            />
          ))}
        </div>
        <div className="flex justify-center w-full pt-12">
          <Button label="Registrarme" />
        </div>
      </div>
      {/* Fifth Page */}
      <div className="min-h-screen bg-white w-full">
        <div className="w-full p-12 bg-ourPathsBackground bg-contain">
          <h1 className="text-title text-center">
            Nuestros <span className="text-primary">Paths</span>
          </h1>
        </div>
        <div className="w-full px-12 bg-white py-20">
          <div className="grid grid-cols-2 justify-items-center">
            {pathAvailables.map(({ name, description, Icon }, index) => (
              <PathAvailable
                key={`path-${index}`}
                name={name}
                description={description}
                Icon={Icon}
              />
            ))}
          </div>
        </div>
        <div className="w-full flex justify-center pb-12">
          <div className="flex justify-center max-w-[900px] flex-wrap">
            {pathNotAvailables.map(({ name }, index) => (
              <div key={`path-${index}`} className="mx-12 my-2">
                <p className="text-[#5A5A5A] text-xl text-center">
                  <span className="font-bold">{name}</span>: próximamente
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
