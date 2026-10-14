import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/common/store/useSessionStore";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  path: "iniciated",
  acceptTerms: false,
};

export function useRegisterForm() {
  const signIn = useSessionStore((state) => state.signIn);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues,
    resolver: zodResolver(registerSchema),
  });

  // Sin backend todavía (roadmap feature 1): abre la sesión local y el
  // SessionGuard del grupo (auth) redirige al dashboard.
  const onSubmit = handleSubmit(({ name, email, path }) => {
    signIn({ name, email, path });
  });

  return { control, onSubmit, isSubmitting };
}
