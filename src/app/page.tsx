import Logo from "@/assets/icons/Logo";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import services from "@/constants/services";

export default function Home() {
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
      {/* Footer */}
      <div className="min-h-screen bg-[black] w-full p-12 grid grid-cols-2">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div></div>
      </div>
    </main>
  );
}
