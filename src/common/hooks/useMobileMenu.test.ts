import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("body scroll lock", () => {
    afterEach(() => {
      document.body.style.overflow = "";
    });

    it("sets body overflow to hidden while open", () => {
      const { result } = renderHook(() => useMobileMenu());
      expect(document.body.style.overflow).toBe("");
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores the previous body overflow when closed", () => {
      const { result } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("hidden");
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("");
    });

    it("restores the previous body overflow when closed with close()", () => {
      const { result } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      act(() => result.current.close());
      expect(document.body.style.overflow).toBe("");
    });

    it("restores the body overflow when Escape closes the menu", () => {
      const { result } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      act(() => pressKey("Escape"));
      expect(result.current.isOpen).toBe(false);
      expect(document.body.style.overflow).toBe("");
    });

    it("restores the body overflow on unmount while open", () => {
      const { result, unmount } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("restores a pre-existing body overflow value, not an empty string", () => {
      document.body.style.overflow = "scroll";
      const { result } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("hidden");
      act(() => result.current.toggle());
      expect(document.body.style.overflow).toBe("scroll");
    });

    it("restores a pre-existing body overflow value on unmount", () => {
      document.body.style.overflow = "auto";
      const { result, unmount } = renderHook(() => useMobileMenu());
      act(() => result.current.toggle());
      unmount();
      expect(document.body.style.overflow).toBe("auto");
    });

    it("does not touch body overflow while closed", () => {
      document.body.style.overflow = "clip";
      const { result } = renderHook(() => useMobileMenu());
      act(() => pressKey("Escape"));
      expect(result.current.isOpen).toBe(false);
      expect(document.body.style.overflow).toBe("clip");
    });
  });
});
