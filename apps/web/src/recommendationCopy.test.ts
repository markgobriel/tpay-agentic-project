import { describe, expect, it } from "vitest";
import { formatRecommendationExplanation, humanizeCategoryLabel } from "./recommendationCopy.js";

describe("recommendationCopy", () => {
  it("humanizes category ids for display", () => {
    expect(humanizeCategoryLabel("debt_minimum_payments")).toBe("debt minimum payments");
    expect(humanizeCategoryLabel("subscriptions")).toBe("subscriptions");
  });

  it("explains cuts in currency without minor-units jargon", () => {
    const text = formatRecommendationExplanation("subscriptions", 4500, 4500, 0);
    expect(text).toContain("$45.00");
    expect(text).toContain("from $45.00 to $0.00");
    expect(text.toLowerCase()).not.toContain("minor");
    expect(text).not.toMatch(/\b4500\b/);
  });
});
