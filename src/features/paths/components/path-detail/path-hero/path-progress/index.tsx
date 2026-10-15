type PathProgressProps = { percent: number };

// El ancho dinámico es la única excepción a "solo Tailwind": el valor viene de los datos.
export function PathProgress({ percent }: PathProgressProps) {
  return (
    <div className="mt-6 max-w-[560px]">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">Tu forja</span>
        <span className="font-sedgwick text-[26px] leading-[1.2] text-secondary">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del path"
        className="h-2 overflow-hidden rounded-full bg-white/15"
      >
        <div className="h-full rounded-full bg-secondary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
