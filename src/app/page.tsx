"use client";
import Logo from "@/assets/icons/Logo";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import PathAvailable from "@/components/PathAvailable";
import Services from "@/components/Services";
import services from "@/constants/services";
import paths from "@/constants/paths";
import { useEffect, useMemo } from "react";
import { Typography } from "@/components/Typography";
import World from "@/assets/icons/World";
import Link from "next/link";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import InstagramIcon from "@/assets/icons/InstagramIcon";
import WorldIcon from "@/assets/icons/WorldIcon";
import { motion } from "framer-motion";
import { homeAnimation } from "@/constants/animations/homeAnimation";
import { servicesAnimation } from "@/constants/animations/servicesAnimation";
import SwordVoicesCarousel from "@/components/SwordVoicesCarousel";
import HouseIcon from "@/assets/icons/HouseIcon";
import { useBackToTopButton } from "@/app/hooks/useBackToTopButton";
import { whatIsSwordvoiceAnimation } from "@/constants/animations/whatIsSwordvoiceAnimation";
import { ourSwordvoicesAnimation } from "@/constants/animations/ourSwordvoicesAnimation";
import { ourPathAnimation } from "@/constants/animations/ourPathAnimation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import useSendEmailOfContact from "@/app/hooks/api/useSendEmailOfContact";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import routes from "@/constants/routes";

const schema = yup
  .object({
    name: yup.string().required(),
    email: yup
      .string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required(),
    message: yup.string().required(),
  })
  .required();

export default function Home() {
  const { showBackToTopButton, handleBackToTop, elementWhereButtonAppears } =
    useBackToTopButton();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    resolver: yupResolver(schema),
  });
  const { sendEmail, isLoading } = useSendEmailOfContact();

  const pathAvailables = useMemo(
    () => paths.filter(({ isAvailable }) => isAvailable),
    [],
  );

  const pathNotAvailables = useMemo(
    () => paths.filter(({ isAvailable }) => !isAvailable),
    [],
  );

  const onSubmit: SubmitHandler<any> = async ({ email, name, message }) => {
    sendEmail(
      { email, name, message },
      {
        onSuccess: () => {
          toast.success("Envío exitoso");
          reset();
        },
        onError: () => {
          toast.error("Ha ocurrido un error");
        },
      },
    );
  };

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar changeLogo={showBackToTopButton} />
      {/* First page */}
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
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Second Page */}
      <motion.div
        ref={elementWhereButtonAppears}
        id="services"
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
                  <Services
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
            <Link href={routes.CONTACT_US}>
              <Button label="Registrarme" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="h-[58px] bg-[black] w-full"></div>
      {/* Third Page */}
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
      {/* Fourth Page */}
      <div className="h-[58px] bg-[black] w-full"></div>
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
      <div className="h-[58px] bg-[black] w-full relative top-2"></div>
      {/* Fifth Page */}
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
            {pathAvailables.map(({ name, description, Icon }, index) => (
              <PathAvailable
                key={`path-${index}`}
                name={name}
                description={description}
                Icon={Icon}
              />
            ))}
          </div>
        </div>
        <div className="w-full flex justify-center pb-12">
          <div className="flex justify-center max-w-[900px] flex-wrap">
            {pathNotAvailables.map(({ name }, index) => (
              <div key={`path-${index}`} className="mx-12 my-2">
                <Typography variant="h5" className="text-[#5A5A5A] text-center">
                  <span className="font-bold">{name}</span>: próximamente
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div
        id="contact_us"
        className="h-auto xl:min-h-screen w-full p-12 grid grid-cols-1 md:grid-cols-2 bg-contactUs bg-cover relative"
      >
        <div className="absolute inset-0 z-1 bg-black opacity-55"></div>
        <form
          className="flex items-center flex-col mb-8 md:mb-0 z-20"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-8 flex justify-center">
            <Logo className="w-[80%] md:w-auto" />
          </div>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <Input
                  label="Nombre y Apellido"
                  onChange={onChange}
                  value={value}
                  isValid={!error?.message}
                />
              );
            }}
          />
          <Controller
            name="email"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <Input
                  label="Correo electrónico"
                  onChange={onChange}
                  value={value}
                  isValid={!error?.message}
                />
              );
            }}
          />
          <Controller
            name="message"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <Textarea
                  label="Mensaje"
                  onChange={onChange}
                  value={value}
                  isValid={!error?.message}
                />
              );
            }}
          />
          <div className="w-full flex justify-end max-w-md mt-2">
            <button
              className="text-primary font-bold"
              type="submit"
              disabled={isLoading}
            >
              ENVIAR
            </button>
          </div>
        </form>
        <div className="flex flex-col items-center p-4 z-10">
          <Typography
            variant="h1"
            className="text-center mb-8 text-secondary hidden md:block font-sedgwick"
          >
            Contáctanos
          </Typography>
          <div className="mb-6 w-full md:w-[90%] lg:w-[70%] max-w-md">
            <World />
          </div>
          <div className="flex justify-center items-center w-100">
            {/* <Link href="" className="p-1 mr-1">
              <InstagramIcon />
            </Link>
            <Link href="">
              <WorldIcon />
            </Link> */}
          </div>
        </div>
      </div>
      {/* Back to top button */}
      <div className="fixed bottom-0 right-5 mb-10 mr-4 z-30">
        {showBackToTopButton && (
          <button onClick={handleBackToTop}>
            <HouseIcon />
          </button>
        )}
      </div>
    </main>
  );
}
