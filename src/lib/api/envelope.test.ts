import { describe, expect, it } from "vitest";
import { ApiError, unwrapEnvelope, unwrapPage } from "./envelope";

describe("unwrapEnvelope", () => {
  it("returns data from a success envelope", () => {
    expect(
      unwrapEnvelope<{ id: string }>(
        { success: true, data: { id: "user-1" } },
        200,
      ),
    ).toEqual({ id: "user-1" });
  });

  it("surfaces the message for 403, 409, and 422", () => {
    for (const status of [403, 409, 422]) {
      expect(() =>
        unwrapEnvelope({ success: false, message: "Not allowed" }, status),
      ).toThrow(ApiError);
      try {
        unwrapEnvelope({ success: false, message: "Not allowed" }, status);
      } catch (error) {
        expect(error).toMatchObject({ status, message: "Not allowed" });
      }
    }
  });

  it("reads a paginated list", () => {
    expect(
      unwrapPage<string>(
        {
          success: true,
          data: { items: ["a"], total: 1, page: 1, perPage: 10, lastPage: 1 },
        },
        200,
      ),
    ).toEqual({ items: ["a"], total: 1, page: 1, perPage: 10, lastPage: 1 });
  });
});
