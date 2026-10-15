const PLACEHOLDER_TOPICS = ["Fundamentos", "Práctica guiada", "Proyecto"];

export function TrailUnderConstruction() {
  return (
    <section aria-label="Camino del path" className="relative">
      <div aria-hidden="true" className="pointer-events-none select-none blur-sm">
        <ol className="relative list-none pl-16">
          {PLACEHOLDER_TOPICS.map((title, index) => (
            <li key={title} className="relative pb-4">
              <span className="absolute -left-[35px] top-0 h-full w-1 rounded bg-white/15" />
              <span className="absolute -left-[46px] top-[22px] h-6 w-6 rotate-45 rounded border-2 border-white/25 bg-black" />
              <div className="flex min-h-[68px] items-center gap-4 rounded-[18px] border border-white/15 bg-[#000E2799] px-5">
                <span className="font-sedgwick text-[26px] text-secondary">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-lg font-bold text-white">{title}</span>
              </div>
            </li>
          ))}
          <li className="relative pb-4">
            <span className="absolute -left-[35px] top-0 h-full w-1 rounded bg-white/15" />
            <div className="rounded-[18px] border border-secondary px-5 py-4 font-bold text-white">Prueba I</div>
          </li>
        </ol>
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-sm rounded-[18px] border border-white/15 bg-black/80 p-6 text-center">
          <p className="font-sedgwick text-[26px] leading-tight text-white">Este path aún no tiene temas</p>
          <p className="mt-2 text-[15px] text-[#C9C9D6]">Estamos forjando su contenido. Vuelve pronto.</p>
        </div>
      </div>
    </section>
  );
}
