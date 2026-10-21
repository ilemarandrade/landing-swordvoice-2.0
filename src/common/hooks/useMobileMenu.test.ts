import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMobileMenu } from "@/common/hooks/useMobileMenu";

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

describe("useMobileMenu", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useMobileMenu());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggle opens and closes the menu", () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("close sets the menu to closed", () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("closes an open menu when Escape is pressed", () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => pressKey("Escape"));
    expect(result.current.isOpen).toBe(false);
  });

  it("ignores keys other than Escape", () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => pressKey("Enter"));
    expect(result.current.isOpen).toBe(true);
  });

  it("keeps the menu closed when Escape is pressed while closed", () => {
    const { result } = renderHook(() => useMobileMenu());
    act(() => pressKey("Escape"));
    expect(result.current.isOpen).toBe(false);
  });

  it("removes the keydown listener when the menu closes", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { result } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    act(() => result.current.close());
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("removes the keydown listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = renderHook(() => useMobileMenu());
    act(() => result.current.toggle());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
