import GithubIcon from "@/common/assets/icons/GithubIcon";
import LinkedinIcon from "@/common/assets/icons/LinkedinIcon";
import WorldIcon from "@/common/assets/icons/WorldIcon";
import type { Mentor } from "@/features/home/schemas/mentor.schema";

type SocialLinksProps = {
  name: string;
  links: Pick<Mentor, "linkedinUrl" | "githubUrl" | "portfolioUrl">;
};

const SOCIALS = [
  { key: "linkedinUrl", label: "LinkedIn", Icon: LinkedinIcon, color: "text-[#0A66C2]" },
  { key: "githubUrl", label: "GitHub", Icon: GithubIcon, color: "text-black" },
  { key: "portfolioUrl", label: "Portafolio", Icon: WorldIcon, color: "text-blue" },
] as const;

export function SocialLinks({ name, links }: SocialLinksProps) {
  return (
    <div className="mt-auto flex gap-2 pt-6">
      {SOCIALS.map(({ key, label, Icon, color }) => {
        const href = links[key];
        if (!href) return null;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} de ${name}`}
            className={`grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-grey-ligth focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary ${color} [&_path]:fill-current [&_svg]:h-7 [&_svg]:w-7`}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
