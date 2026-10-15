import type { ComponentType } from "react";
import { ButtonLink } from "@/common/components/button-link";
import { Typography } from "@/common/components/typography";
import { SwordRule } from "@/common/components/path-card/sword-rule";

type PathCardProps = {
  Icon: ComponentType<{ width?: number }>;
  name: string;
  description: string;
  href: string;
  ctaLabel?: string;
};

export function PathCard({
  Icon,
  name,
  description,
  href,
  ctaLabel = "Ver path",
}: PathCardProps) {
  return (
    <article className="relative flex flex-col gap-6 overflow-hidden rounded-[18px] border border-white/15 bg-blurry p-6 transition-colors hover:border-white/25 md:p-10">
      <div className="flex items-center gap-5">
        <span className="flex-none text-secondary [&_path]:fill-current">
          <Icon width={85} />
        </span>
        <Typography
          as="h3"
          variant="h1"
          className="font-sedgwick leading-[1.1] text-white"
        >
          {name}
        </Typography>
      </div>
      <SwordRule />
      <Typography variant="body" className="text-grey">
        {description}
      </Typography>
      <ButtonLink href={href} label={ctaLabel} fullWidth />
    </article>
  );
}
