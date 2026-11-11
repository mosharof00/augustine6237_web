import { describe, expect, it } from "vitest";
import { missingOpenApiMessage } from "./generate.mjs";

describe("openapi generate", () => {
  it("names the three document sources when none exist", () => {
    const message = missingOpenApiMessage();
    expect(message).toContain("WINGS_OPENAPI_PATH");
    expect(message).toContain("../docs/openapi.json");
    expect(message).toContain("${NEXT_PUBLIC_API_URL}/docs-json");
  });
});
