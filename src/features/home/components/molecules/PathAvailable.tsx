"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Typography } from "@/common/components/atoms/Typography";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import { ourPathAnimation } from "@/features/home/constants/animations/ourPathAnimation";

type PathAvailableProps = {
  Icon: ComponentType<{ width?: number }>;
  name: string;
  description: string;
};

export function PathAvailable({ Icon, name, description }: PathAvailableProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true }}
      variants={ourPathAnimation.path}
      className="md:max-w-md flex flex-col mb-12 md:mb-0"
    >
      <div className="flex items-center justify-center">
        <Icon width={isMobile ? 85 : undefined} />
      </div>
      <div>
        <Typography variant="h5" className="text-[black] text-center font-bold">
          {name}
        </Typography>
        <Typography variant="h6" className="text-[black] text-center">
          {description}
        </Typography>
      </div>
    </motion.div>
  );
}
