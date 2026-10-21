import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserSearchForm } from "@/features/admin/components/users-admin/user-search-form";
import { useUserSearchForm } from "@/features/admin/hooks/useUserSearchForm";

const FIELD_LABEL = "Buscar por nombre o correo";

function Harness({
  currentSearch = "",
  onSearch,
}: {
  currentSearch?: string;
  onSearch: (search: string) => void;
}) {
  const form = useUserSearchForm(currentSearch, onSearch);
  return <UserSearchForm control={form.control} onSubmit={form.onSubmit} />;
}

// userEvent no sirve con timers falsos: RTL drena con setTimeout y se cuelga.
// Cada fireEvent.change equivale a una tecla; Enter en un formulario de un
// solo campo es un submit del formulario.
function typeInto(field: HTMLElement, text: string) {
  let value = "";
  for (const char of text) {
    value += char;
    fireEvent.change(field, { target: { value } });
  }
}

// Enter: submit del formulario; act async deja correr la validación asíncrona.
async function submitSearch() {
  await act(async () => {
    fireEvent.submit(screen.getByRole("search"));
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("useUserSearchForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("searches once, 300 ms after the last keystroke", () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    typeInto(screen.getByLabelText(FIELD_LABEL), "ana");

    advance(299);
    expect(onSearch).not.toHaveBeenCalled();

    advance(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("ana");

    advance(1000);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("does not restart the debounce when the parent re-renders with a new onSearch", () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <Harness onSearch={(search) => onSearch(search)} />,
    );

    typeInto(screen.getByLabelText(FIELD_LABEL), "ana");
    advance(150);

    // Nueva identidad de función, misma búsqueda: no debe reiniciar el timer.
    rerender(<Harness onSearch={(search) => onSearch(search)} />);

    advance(149);
    expect(onSearch).not.toHaveBeenCalled();

    advance(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("ana");

    advance(1000);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("navigates once when Enter is pressed during the debounce window", async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    typeInto(screen.getByLabelText(FIELD_LABEL), "ana");
    await submitSearch();
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("ana");

    advance(1000);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("does not navigate on Enter when the search did not change", async () => {
    const onSearch = vi.fn();
    render(<Harness currentSearch="ana" onSearch={onSearch} />);

    await submitSearch();
    advance(1000);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("shows the length error on Enter and does not navigate over 100 characters", async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText(FIELD_LABEL), {
      target: { value: "a".repeat(101) },
    });
    await submitSearch();

    expect(
      screen.getByText("La búsqueda no puede superar 100 caracteres"),
    ).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });
});
