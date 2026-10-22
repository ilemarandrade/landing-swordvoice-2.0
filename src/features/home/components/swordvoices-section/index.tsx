"use client";
import { motion } from "framer-motion";
import { Typography } from "@/common/components/typography";
import { SectionDivider } from "@/features/home/components/section-divider";
import { MentorsError } from "@/features/home/components/swordvoices-section/mentors-error";
import { MentorsSkeleton } from "@/features/home/components/swordvoices-section/mentors-skeleton";
import { SwordVoicesCarousel } from "@/features/home/components/swordvoices-section/swordvoices-carousel";
import { ourSwordvoicesAnimation } from "@/features/home/constants/animations/ourSwordvoicesAnimation";
import { useMentorsQuery } from "@/features/home/hooks/useMentorsQuery";

export function SwordvoicesSection() {
  const { data, isPending, isError, refetch } = useMentorsQuery();

  if (data?.length === 0) return null;

  return (
    <motion.div className="relative w-full bg-ourSwordVoices bg-cover bg-center">
      <div className="bg-blurry px-4 py-20 md:px-12">
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true }}
          className="w-full overflow-hidden pt-1"
        >
          <motion.div variants={ourSwordvoicesAnimation.title}>
            <Typography variant="h1" className="text-center font-sedgwick">
              Nuestras <span className="text-primary">Swordvoices</span>
            </Typography>
            <p className="mx-auto mb-8 mt-3 max-w-[560px] text-center text-[17px] leading-relaxed text-[#E6E6EE]">
              Mentores que ya recorrieron el camino que estás empezando. Te
              asignamos uno según tu path.
            </p>
          </motion.div>
        </motion.div>
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true }}
          variants={ourSwordvoicesAnimation.show}
          transition={{
            delay: 0.8,
          }}
          className="w-full"
        >
          <div className="mx-auto">
            {isPending && <MentorsSkeleton />}
            {isError && <MentorsError onRetry={() => refetch()} />}
            {data && <SwordVoicesCarousel mentors={data} />}
          </div>
        </motion.div>
      </div>
      {data && <SectionDivider className="relative top-2" />}
    </motion.div>
  );
}
