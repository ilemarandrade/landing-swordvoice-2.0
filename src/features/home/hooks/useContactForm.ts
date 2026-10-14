import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { notifyError } from "@/common/errors/notifyError";
import { useSendContactEmail } from "@/features/home/hooks/useSendContactEmail";
import {
  contactSchema,
  type ContactFormValues,
} from "@/features/home/schemas/contact.schema";

const defaultValues: ContactFormValues = { name: "", email: "", message: "" };

export function useContactForm() {
  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    defaultValues,
    resolver: zodResolver(contactSchema),
  });
  const { mutate, isPending } = useSendContactEmail();

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Envío exitoso");
        reset();
      },
      onError: notifyError,
    });
  });

  return { control, onSubmit, isSubmitting: isPending };
}
