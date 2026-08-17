import { describe, expect, it } from "vitest";
import { apiPath } from "./apiPath.js";

describe("API deployment paths", () => {
  it("keeps local routes unchanged and prefixes Vercel production routes", () => {
    expect(apiPath("/account", "")).toBe("/account");
    expect(apiPath("/analytics?month=2026-07", "/api")).toBe("/api/analytics?month=2026-07");
    expect(apiPath("/savings-goal", "/api/")).toBe("/api/savings-goal");
  });
});
