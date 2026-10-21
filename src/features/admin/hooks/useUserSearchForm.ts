import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  userSearchSchema,
  type UserSearchFormValues,
} from "@/features/admin/schemas/userSearch.schema";

const SEARCH_DEBOUNCE_MS = 300;

export function useUserSearchForm(
  currentSearch: string,
  onSearch: (search: string) => void,
) {
  const { control, handleSubmit } = useForm<UserSearchFormValues>({
    defaultValues: { search: currentSearch },
    resolver: zodResolver(userSearchSchema),
  });
  const search = useWatch({ control, name: "search" });
  // El callback cambia en cada render del padre: guardarlo en un ref evita reiniciar el debounce.
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Busca al dejar de escribir; Enter busca al momento.
  useEffect(() => {
    const value = search.trim().slice(0, 100);
    if (value === currentSearch) return;
    timerRef.current = setTimeout(
      () => onSearchRef.current(value),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timerRef.current);
  }, [search, currentSearch]);

  const onSubmit = handleSubmit(({ search: value }) => {
    // Enter navega ya: el debounce pendiente no debe repetir la navegación.
    clearTimeout(timerRef.current);
    if (value !== currentSearch) onSearchRef.current(value);
  });

  return { control, onSubmit };
}
