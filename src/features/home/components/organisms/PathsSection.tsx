"use client";
import { motion } from "framer-motion";
import { Typography } from "@/common/components/atoms/Typography";
import { PathAvailable } from "@/features/home/components/molecules/PathAvailable";
import { ourPathAnimation } from "@/features/home/constants/animations/ourPathAnimation";
import { availablePaths, upcomingPaths } from "@/features/home/constants/paths";

export function PathsSection() {
  return (
    <div id="our_paths" className="h-auto xl:min-h-screen bg-white w-full">
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true }}
        className="w-full p-12 bg-ourPathsBackground bg-cover bg-no-repeat bg-center overflow-hidden"
      >
        <motion.div variants={ourPathAnimation.title}>
          <Typography variant="h1" className="text-center font-sedgwick">
            Nuestros <span className="text-primary">Paths</span>
          </Typography>
        </motion.div>
      </motion.div>
      <div className="w-full px-4 bg-white py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center">
          {availablePaths.map(
            ({ name, description, Icon }, index) =>
              Icon && (
                <PathAvailable
                  key={`path-${index}`}
                  name={name}
                  description={description}
                  Icon={Icon}
                />
              ),
          )}
        </div>
      </div>
      <div className="w-full flex justify-center pb-12">
        <div className="flex justify-center max-w-[900px] flex-wrap">
          {upcomingPaths.map(({ name }, index) => (
            <div key={`path-${index}`} className="mx-12 my-2">
              <Typography variant="h5" className="text-[#5A5A5A] text-center">
                <span className="font-bold">{name}</span>: próximamente
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
