import { afterEach, describe, expect, it, vi } from "vitest";
import { SEARCH_DEBOUNCE_MS, scheduleSearch } from "./search";

describe("scheduleSearch", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits about 300ms before reporting the search text", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    scheduleSearch(onChange, "maya");
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith("maya");
  });
});
