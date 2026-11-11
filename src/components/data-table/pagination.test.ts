import { describe, expect, it, vi } from "vitest";
import { nextPage, pageLabel, showingLabel } from "./pagination";

describe("table pagination", () => {
  it("labels page 1 of an 80-row list as Showing 1–12 of 80 and 1 / 7", () => {
    expect(showingLabel(1, 12, 80)).toBe("Showing 1–12 of 80");
    expect(pageLabel(1, 7)).toBe("1 / 7");
  });

  it("moves to page 2 when next is used", () => {
    const onPageChange = vi.fn();
    const next = nextPage(1, 7);
    if (next !== null) onPageChange(next);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
