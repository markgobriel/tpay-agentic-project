import { describe, expect, it } from "vitest";
import { discoveryNeeded, validationFailed } from "./continuation-policy.mjs";

describe("autonomous continuation policy", () => {
  it("starts discovery for every active autonomy mode when the backlog is empty", () => {
    for (const autonomyMode of ["codex_evolution", "product_evolution", "usability_evolution"]) {
      expect(
        discoveryNeeded(
          {
            projectStatus: "active",
            autonomyMode,
            lastValidation: { result: "pass" },
          },
          [{ status: "done" }],
        ),
      ).toBe(true);
    }
  });

  it("does not hide current or legacy validation failures behind discovery", () => {
    expect(validationFailed({ result: "fail" })).toBe(true);
    expect(validationFailed({ status: "failed" })).toBe(true);
    expect(
      discoveryNeeded({ projectStatus: "active", lastValidation: { result: "fail" } }, [
        { status: "done" },
      ]),
    ).toBe(false);
  });

  it("continues existing work before creating another task", () => {
    expect(
      discoveryNeeded({ projectStatus: "active", lastValidation: { result: "pass" } }, [
        { status: "in_progress" },
      ]),
    ).toBe(false);
  });
});
