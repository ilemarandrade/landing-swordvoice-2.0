import Logo from "@/assets/icons/Logo";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import PathAvailable from "@/components/PathAvailable";
import Services from "@/components/Services";
import SwordvoicesCard from "@/components/SwordvoicesCard";
import services from "@/constants/services";
import swordvoices from "@/constants/swordvoices";
import paths from "@/constants/paths";
import { useMemo } from "react";
import { Typography } from "@/components/Typography";
import World from "@/assets/icons/World";
import Link from "next/link";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import InstagramIcon from "@/assets/icons/InstagramIcon";
import WorldIcon from "@/assets/icons/WorldIcon";

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
          <h1 className="text-title leading-[48px] text-center title">Swordvoice Academy</h1>
          <p className="text-base">
            <span className="font-bold text-center">Academia online</span> no tradicional
          </p>
          <Typography variant="h1" className="font-sedgwick">
            Swordvoice Academy
          </Typography>
          <Typography>
            <span className="font-bold">Academia online</span> no tradicional
          </Typography>
        </div>
        <Button label="Registrarme" />
      </div>
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Second Page */}
      <div className="px-12 py-12 sm:px-20 md:px-32 md:py-32 lg:min-h-screen bg-whatIsSwordvoices w-full bg-cover bg-bottom bg-no-repeat flex justify-end items-center">
        <div className="w-full lg:w-[45%]">
          <Typography variant="h1" className="mb-8 font-sedgwick">
            ¿Qué es <br />
            <span className="text-primary">Swordvoice</span>
            <span className="text-secondary"> Academy</span>?
          </Typography>
          <Typography variant="h6" className="mb-4">
            Hola, somos <span className="font-bold">Swordvoice academy</span> y
            si buscas cursos online tradicionales{" "}
            <span className="font-bold">NO</span> estás en el lugar correcto.
          </Typography>
          <Typography variant="h6">
            Nosotros ofrecemos un modelo diferente, un modelo de mentorías.
            Sabemos que la informacion está disponible en la Web, pero{" "}
            <span className="font-bold">¿por dónde empezar?</span>. Tu{" "}
            <span className="font-bold">MENTOR</span> asignado te proveerá de
            los recursos y el plan que debes seguir para que no pierdas tiempo.
          </Typography>
        </div>
      </div>
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Third Page */}
      <div className="min-h-screen bg-[black] w-full p-6 lg:px-[100px] lg:pb-12 lg:pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 ">
          <div className="relative">
            <Typography
              variant="h1"
              className="font-sedgwick mb-12 md:absolute md:top-[-32px] text-center md:text-left"
            >
              ¿Qué incluye <br />
              <span className="text-secondary">nuestro servicio?</span>
            </Typography>
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
      {/* Fourth Page */}
      <div className="min-h-screen bg-ourSwordVoices w-full bg-cover bg-bottom bg-no-repeat pt-12">
        <Typography variant="h1" className="text-center font-sedgwick">
          Nuestras <span className="text-primary">Swordvoices</span>
        </Typography>
        <div className="flex flex-wrap justify-center my-8">
          {swordvoices.map((swordvoice, index) => (
            <SwordvoicesCard
              key={`swordvoices-${index}`}
              linkedin={swordvoice.linkedin}
              github={swordvoice.github}
              portfolio={swordvoice.portfolio}
              name={swordvoice.name}
              photo={swordvoice.photo}
              rol={swordvoice.rol}
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation"
            />
          ))}
        </div>
      </div>
      {/* Fifth Page */}
      <div className="min-h-screen bg-white w-full">
        <div className="w-full p-12 bg-ourPathsBackground bg-contain">
          <Typography variant="h1" className="text-center font-sedgwick">
            Nuestros <span className="text-primary">Paths</span>
          </Typography>
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
                <Typography variant="h5" className="text-[#5A5A5A] text-center">
                  <span className="font-bold">{name}</span>: próximamente
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="min-h-screen bg-[black] w-full p-12 grid grid-cols-1 md:grid-cols-2">
        <div className="flex items-center flex-col mb-8 md:mb-0">
          <div className="mb-8">
            <Logo />
          </div>
          <Input label="Nombre y Apellido" />
          <Input label="Correo electrónico" />
          <Textarea label="Mensaje" />
          <div className="w-full flex justify-end max-w-md mt-2">
            <button className="text-primary font-bold">ENVIAR</button>
          </div>
        </div>
        <div className="flex flex-col items-center p-4">
          <Typography
            variant="h1"
            className="text-center mb-8 text-secondary hidden md:block"
          >
            Contáctanos
          </Typography>
          <div className="mb-6 w-full md:w-[90%] lg:w-[70%] max-w-md">
            <World />
          </div>
          <div className="flex justify-center items-center w-100">
            <Link href="" className="p-1 mr-1">
              <InstagramIcon />
            </Link>
            <Link href="">
              <WorldIcon />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
