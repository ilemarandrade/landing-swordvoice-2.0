import Link from "next/link";
import type { LegalSectionContent } from "@/features/legal/constants/legalDocument";

type LegalSectionProps = { number: number; section: LegalSectionContent };

export function LegalSection({ number, section }: LegalSectionProps) {
  return (
    <section id={section.id} className="flex scroll-mt-8 flex-col gap-3">
      <h2 className="text-2xl font-bold leading-snug">
        {number}. {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed">
          {paragraph}
        </p>
      ))}
      {section.items && (
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {section.items.map((item) => (
            <li key={item.label} className="leading-relaxed">
              <strong>{item.label}:</strong> {item.text}
            </li>
          ))}
        </ul>
      )}
      {section.links && (
        <p className="flex flex-wrap gap-4">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-blue underline hover:text-[#0A2C37]"
            >
              {link.label}
            </Link>
          ))}
        </p>
      )}
    </section>
  );
}
