export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
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
    </main>
  );
}
