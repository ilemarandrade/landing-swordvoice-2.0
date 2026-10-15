import CrownIcon from "@/common/assets/icons/CrownIcon";

type RankStepProps = { pathName: string; requiredCount: number; isComplete: boolean };

export function RankStep({ pathName, requiredCount, isComplete }: RankStepProps) {
  return (
    <li className="relative pb-16 pt-2">
      <span aria-hidden="true" className={`absolute -left-[35px] top-0 h-full w-1 rounded ${isComplete ? "bg-secondary" : "bg-white/15"}`} />
      <span aria-hidden="true" className={`absolute -left-[50px] top-1 grid h-8 w-8 place-items-center rounded border-2 border-primary ${isComplete ? "bg-primary text-black" : "bg-black text-primary"}`}>
        <CrownIcon />
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">
        {isComplete ? "Rango obtenido" : "Rango al completar"}
      </p>
      <p className="font-sedgwick text-[40px] leading-[1.1] text-primary">{pathName}</p>
      <p className="mb-4 mt-1 max-w-[520px] text-[15px] text-[#C9C9D6]">
        {isComplete
          ? "Superaste todas las pruebas. Tu espada está forjada."
          : `Supera las ${requiredCount} pruebas para obtener este rango y que te asignemos un Mentor.`}
      </p>
    </li>
  );
}
