import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  contactSchema,
  type ContactFormValues,
} from "@/features/home/schemas/contact.schema";

const defaultValues: ContactFormValues = { name: "", email: "", message: "" };

export function useContactForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues,
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = handleSubmit(() => {
    // El envío del formulario se define en un próximo scope.
  });

  return { control, onSubmit, isSubmitting };
}
