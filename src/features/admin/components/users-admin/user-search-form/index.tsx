import { InputController } from "@/common/components/input-controller";
import type { useUserSearchForm } from "@/features/admin/hooks/useUserSearchForm";

type UserSearchFormProps = Pick<
  ReturnType<typeof useUserSearchForm>,
  "control" | "onSubmit"
>;

export function UserSearchForm({ control, onSubmit }: UserSearchFormProps) {
  return (
    <form noValidate role="search" onSubmit={onSubmit} className="max-w-md">
      <InputController
        control={control}
        name="search"
        label="Buscar por nombre o correo"
        type="search"
        autoComplete="off"
      />
    </form>
  );
}
