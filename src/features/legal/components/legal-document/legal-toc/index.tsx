import type { LegalSectionContent } from "@/features/legal/constants/legalDocument";

type LegalTocProps = { sections: LegalSectionContent[] };

export function LegalToc({ sections }: LegalTocProps) {
  return (
    <nav
      aria-labelledby="legal-toc-title"
      className="flex w-full flex-col gap-2 md:sticky md:top-8 md:w-64 md:flex-none"
    >
      <h2 id="legal-toc-title" className="text-sm font-bold uppercase tracking-wider">
        Contenido
      </h2>
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded-md px-3 py-2.5 text-[15px] text-black no-underline hover:bg-black/5"
        >
          {index + 1}. {section.title}
        </a>
      ))}
    </nav>
  );
}
