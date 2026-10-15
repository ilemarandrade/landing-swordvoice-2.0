"use client";
import Logo from "@/common/assets/icons/Logo";
import { InputController } from "@/common/components/input-controller";
import { useContactForm } from "@/features/home/hooks/useContactForm";

export function ContactForm() {
  const { control, onSubmit, isSubmitting } = useContactForm();

  return (
    <form
      noValidate
      className="flex items-center flex-col mb-8 md:mb-0 z-20"
      onSubmit={onSubmit}
    >
      <div className="mb-8 flex justify-center">
        <Logo className="w-[80%] md:w-auto" />
      </div>
      <InputController
        control={control}
        name="name"
        label="Nombre y Apellido"
        autoComplete="name"
      />
      <InputController
        control={control}
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
      />
      <InputController
        control={control}
        name="message"
        label="Mensaje"
        multiline
      />
      <div className="w-full flex justify-end max-w-md mt-2">
        <button
          className="text-primary font-bold"
          type="submit"
          disabled={isSubmitting}
        >
          ENVIAR
        </button>
      </div>
    </form>
  );
}
