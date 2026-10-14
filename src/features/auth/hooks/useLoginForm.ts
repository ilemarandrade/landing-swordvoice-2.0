import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/common/store/useSessionStore";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
  remember: false,
};

export function useLoginForm() {
  const signIn = useSessionStore((state) => state.signIn);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  // Sin backend todavía (roadmap feature 1): abre la sesión local y el
  // SessionGuard del grupo (auth) redirige al dashboard. `remember` se
  // enviará al backend cuando exista.
  const onSubmit = handleSubmit(({ email }) => {
    signIn({ name: email.split("@")[0], email, path: null });
  });

  return { control, onSubmit, isSubmitting };
}
