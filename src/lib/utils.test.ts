import { expect, test } from "vitest";

import { cn } from "@/lib/utils";

test("cn joins class names", () => {
  expect(cn("text-sm", "font-medium")).toBe("text-sm font-medium");
});
