"use client";
import Logo from "@/common/assets/icons/Logo";
import { Input } from "@/common/components/input";
import { Textarea } from "@/common/components/textarea";
import { useContactForm } from "@/features/home/hooks/useContactForm";

export function ContactForm() {
  const { register, errors, onSubmit, isSubmitting } = useContactForm();

  return (
    <form
      noValidate
      className="flex items-center flex-col mb-8 md:mb-0 z-20"
      onSubmit={onSubmit}
    >
      <div className="mb-8 flex justify-center">
        <Logo className="w-[80%] md:w-auto" />
      </div>
      <Input
        label="Nombre y Apellido"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Textarea
        label="Mensaje"
        error={errors.message?.message}
        {...register("message")}
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
