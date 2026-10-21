type UsersPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const buttonClassName =
  "min-h-11 rounded-full border-2 border-white/35 px-5 font-semibold hover:border-primary disabled:opacity-40 disabled:hover:border-white/35";

export function UsersPagination({
  page,
  totalPages,
  onPageChange,
}: UsersPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="flex items-center gap-4">
      <button
        type="button"
        className={buttonClassName}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className="text-sm text-[#C9C9D6]">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={buttonClassName}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
