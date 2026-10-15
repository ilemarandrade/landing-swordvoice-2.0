import { LegalHero } from "@/features/legal/components/legal-document/legal-hero";
import { LegalSection } from "@/features/legal/components/legal-document/legal-section";
import { LegalToc } from "@/features/legal/components/legal-document/legal-toc";
import type { LegalDocumentContent } from "@/features/legal/constants/legalDocument";

type LegalDocumentProps = { content: LegalDocumentContent };

export function LegalDocument({ content }: LegalDocumentProps) {
  return (
    <main className="flex flex-col text-black">
      <LegalHero title={content.title} updatedAt={content.updatedAt} />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-8 md:flex-row md:items-start md:px-12 md:py-[72px]">
        <LegalToc sections={content.sections} />
        <article className="flex max-w-3xl flex-1 flex-col gap-10">
          <p className="text-[19px] leading-relaxed">{content.intro}</p>
          {content.sections.map((section, index) => (
            <LegalSection key={section.id} number={index + 1} section={section} />
          ))}
        </article>
      </div>
    </main>
  );
}
