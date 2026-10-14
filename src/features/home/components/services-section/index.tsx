"use client";
import { motion } from "framer-motion";
import { ButtonLink } from "@/common/components/button-link";
import { Typography } from "@/common/components/typography";
import { routes } from "@/common/constants/routes";
import { ServiceItem } from "@/features/home/components/services-section/service-item";
import { servicesAnimation } from "@/features/home/constants/animations/servicesAnimation";
import { SERVICES_SECTION_ID } from "@/features/home/constants/sections";
import { services } from "@/features/home/constants/services";

export function ServicesSection() {
  return (
    <motion.div
      id={SERVICES_SECTION_ID}
      className="h-auto xl:min-h-screen bg-ourServices bg-cover w-full p-4 md:px-8 lg:px-[100px] lg:pb-12 lg:pt-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 ">
        <motion.div className="relative" variants={servicesAnimation.title}>
          <Typography
            variant="h1"
            className="font-sedgwick mb-12 md:absolute md:top-[-32px] text-center md:text-left leading-[3.2rem] md:leading-[3.5rem]"
          >
            ¿Qué incluye <br />
            <span className="text-secondary">nuestro servicio?</span>
          </Typography>
        </motion.div>
        {services.map(({ title, description, Icon }, index) => {
          return (
            <motion.div
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true }}
              key={`services-${index}`}
              className="overflow-hidden"
            >
              <motion.div
                key={`services-${index}`}
                variants={
                  index % 2
                    ? servicesAnimation.elementInRight
                    : servicesAnimation.elementInLeft
                }
                transition={{ delay: 0.5 + index / 10 }}
                className="relative"
              >
                <ServiceItem
                  title={title}
                  description={description}
                  icon={<Icon className={""} />}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
        className="flex justify-center w-full pt-12"
      >
        <motion.div variants={servicesAnimation.registerButton}>
          <ButtonLink
            href={routes.REGISTER}
            label="Registrarme"
            className="mt-4"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
