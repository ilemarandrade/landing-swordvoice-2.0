import { SocialLinks } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card/social-links";
import { SwordvoicePhoto } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card/swordvoice-photo";
import type { Mentor } from "@/features/home/schemas/mentor.schema";
import { formatExperience } from "@/features/home/utils/formatExperience";

type SwordvoicesCardProps = { mentor: Mentor; className?: string };

export function SwordvoicesCard({
  mentor,
  className = "",
}: SwordvoicesCardProps) {
  const {
    name,
    professionalTitle,
    shortDescription,
    yearsOfExperience,
    photoUrl,
  } = mentor;

  return (
    <article
      className={`${className} max-w-sm group mx-3 flex h-full flex-col overflow-hidden rounded-[18px] bg-white text-black transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <SwordvoicePhoto
        name={name}
        photoUrl={photoUrl}
        experience={formatExperience(yearsOfExperience)}
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 text-2xl font-bold">{professionalTitle}</p>
        <p className="line-clamp-5 text-sm md:text-base">{shortDescription}</p>
        <SocialLinks name={name} links={mentor} />
      </div>
    </article>
  );
}
