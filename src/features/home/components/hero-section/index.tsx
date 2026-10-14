"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/common/components/button";
import { Typography } from "@/common/components/typography";
import { routes } from "@/common/constants/routes";
import { homeAnimation } from "@/features/home/constants/animations/homeAnimation";
import { useScrollToTopOnMount } from "@/features/home/hooks/useScrollToTopOnMount";

export function HeroSection() {
  useScrollToTopOnMount();

  return (
    <motion.div
      id="home"
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true }}
      className="h-screen bg-home w-full bg-cover bg-bottom bg-no-repeat border-b-2 border-b-[black] justify-center items-center flex flex-col"
    >
      <motion.div
        variants={homeAnimation.containerTitle}
        transition={{ when: "beforeChildren", duration: 1.2, delay: 0.5 }}
        className="flex flex-col items-center bg-[#000e2799] w-[95%] py-2 overflow-hidden"
      >
        <motion.div
          variants={homeAnimation.titleCenter}
          transition={{ duration: 1 }}
        >
          <Typography variant="h1" className="font-sedgwick">
            Swordvoice Academy
          </Typography>
        </motion.div>
        <motion.div
          transition={{ duration: 1.2 }}
          variants={homeAnimation.titleCenter}
        >
          <Typography>
            <span className="font-bold">Academia online</span> no tradicional
          </Typography>
        </motion.div>
      </motion.div>
      <motion.div variants={homeAnimation.registerButton}>
        <Link href={routes.CONTACT_US}>
          <Button label="Registrarme" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
