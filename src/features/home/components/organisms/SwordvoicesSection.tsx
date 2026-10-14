"use client";
import { motion } from "framer-motion";
import { Typography } from "@/common/components/atoms/Typography";
import { SwordVoicesCarousel } from "@/features/home/components/organisms/SwordVoicesCarousel";
import { ourSwordvoicesAnimation } from "@/features/home/constants/animations/ourSwordvoicesAnimation";

export function SwordvoicesSection() {
  return (
    <motion.div className="h-auto xl:min-h-screen bg-ourSwordVoices w-full bg-cover bg-bottom bg-no-repeat pt-12">
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
        <SwordVoicesCarousel />
      </motion.div>
    </motion.div>
  );
}
