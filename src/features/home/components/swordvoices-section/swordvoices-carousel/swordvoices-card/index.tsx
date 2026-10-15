import type { Swordvoice } from "@/features/home/constants/swordvoices";
import { SocialLinks } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card/social-links";
import { SwordvoicePhoto } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card/swordvoice-photo";

type SwordvoicesCardProps = { swordvoice: Swordvoice; className?: string };

export function SwordvoicesCard({
  swordvoice,
  className = "",
}: SwordvoicesCardProps) {
  const { name, role, photo, experience, bio, tags, links } = swordvoice;

  return (
    <article
      className={`${className} group mx-3 flex h-full flex-col overflow-hidden rounded-[18px] bg-white text-black transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <SwordvoicePhoto name={name} photo={photo} experience={experience} />
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 text-2xl font-bold">{role}</p>
        <p className="line-clamp-5 text-sm md:text-base">{bio}</p>
        {/* <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-blue px-2.5 py-0.5 text-[11px] uppercase leading-4 tracking-[0.05em] text-blue"
            >
              {tag}
            </li>
          ))}
        </ul> */}
        <SocialLinks name={name} links={links} />
      </div>
    </article>
  );
}
