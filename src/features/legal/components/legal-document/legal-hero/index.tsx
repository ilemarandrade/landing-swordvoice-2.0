type LegalHeroProps = { title: string; updatedAt: string };

export function LegalHero({ title, updatedAt }: LegalHeroProps) {
  return (
    <div className="relative bg-ourServices bg-cover bg-center px-4 py-12 text-center text-white md:px-12 md:py-20">
      <div aria-hidden="true" className="absolute inset-0 bg-black/[0.35]" />
      <div className="relative flex flex-col items-center gap-3">
        <h1 className="font-sedgwick text-[40px] leading-tight md:text-[56px]">
          {title}
        </h1>
        <p className="text-[15px] text-[#E6E6EE]">
          Última actualización: {updatedAt}
        </p>
      </div>
    </div>
  );
}
