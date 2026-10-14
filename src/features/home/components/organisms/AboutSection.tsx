"use client";
import { motion } from "framer-motion";
import { Typography } from "@/common/components/atoms/Typography";
import { whatIsSwordvoiceAnimation } from "@/features/home/constants/animations/whatIsSwordvoiceAnimation";

export function AboutSection() {
  return (
    <div
      id="meet-us"
      className="px-12 py-12 sm:px-20 md:px-32 md:py-32 h-auto xl:min-h-screen bg-whatIsSwordvoices w-full bg-cover bg-bottom bg-no-repeat flex justify-end items-center"
    >
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
        className="w-full lg:w-[45%] overflow-x-hidden pt-1"
      >
        <motion.div
          className="w-full"
          variants={whatIsSwordvoiceAnimation.elementInRight}
        >
          <Typography
            variant="h1"
            className="mb-8 font-sedgwick text-center md:text-left"
          >
            ¿Qué es <br />
            <span className="text-primary">Swordvoice</span>
            <span className="text-secondary"> Academy</span>?
          </Typography>
        </motion.div>
        <motion.div
          variants={whatIsSwordvoiceAnimation.text}
          transition={{ delay: 1 }}
        >
          <Typography variant="h6" className="mb-4 text-justify md:text-left">
            Hola, somos <span className="font-bold">Swordvoice academy</span>{" "}
            y si buscas cursos online tradicionales{" "}
            <span className="font-bold">NO</span> estás en el lugar correcto.
          </Typography>
          <Typography variant="h6" className="text-justify md:text-left">
            Nosotros ofrecemos un modelo diferente, un modelo de mentorías.
            Sabemos que la informacion está disponible en la Web, pero{" "}
            <span className="font-bold">¿por dónde empezar?</span>. Tu{" "}
            <span className="font-bold">MENTOR</span> asignado te proveerá de
            los recursos y el plan que debes seguir para que no pierdas
            tiempo.
          </Typography>
        </motion.div>
      </motion.div>
    </div>
  );
}
