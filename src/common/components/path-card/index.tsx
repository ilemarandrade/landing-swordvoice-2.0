import type { ComponentType } from "react";
import { ButtonLink } from "@/common/components/button-link";
import { Typography } from "@/common/components/typography";
import { SwordRule } from "@/common/components/path-card/sword-rule";

type PathCardStat = { value: number; label: string };

type PathCardProps = {
  Icon: ComponentType<{ width?: number }>;
  name: string;
  description: string;
  href: string;
  ctaLabel?: string;
  eyebrow?: string;
  stats?: PathCardStat[];
};

export function PathCard({
  Icon,
  name,
  description,
  href,
  ctaLabel = "Ver",
  eyebrow,
  stats,
}: PathCardProps) {
  return (
    <article className="relative flex flex-col gap-6 overflow-hidden rounded-[18px] border border-white/15 bg-[#000E2799] p-6 transition-colors hover:border-white/25 md:p-10">
      <div className="flex items-center gap-5">
        <span className="flex-none text-secondary [&_path]:fill-current">
          <Icon width={85} />
        </span>
        <div>
          {/* {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">
              {eyebrow}
            </p>
          )} */}
          <Typography
            as="h3"
            variant="h1"
            className="font-sedgwick leading-[1.1] text-white"
          >
            {name}
          </Typography>
        </div>
      </div>
      <SwordRule />
      {stats && stats.length > 0 && (
        <dl className="flex gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-0.5">
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#9A9AAE]">
                {stat.label}
              </dt>
              <dd className="font-sedgwick text-[26px] leading-[1.2] text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <Typography variant="body" className="text-grey">
        {description}
      </Typography>
      <ButtonLink href={href} label={ctaLabel} fullWidth />
    </article>
  );
}
