import { describe, expect, it } from "vitest";
import { formatStatus } from "./status-format.mjs";

const backlog = {
  tasks: [{ status: "done" }, { status: "done" }, { status: "in_progress" }],
};

describe("formatStatus", () => {
  it("reports the current result/notes state shape instead of falsely saying not run", () => {
    const output = formatStatus(
      {
        projectStatus: "active",
        currentTaskId: null,
        iteration: 30,
        lastValidation: {
          command: "npm run validate",
          result: "pass",
          at: "2026-08-12T11:14:11Z",
        },
        lastVerifier: {
          result: "pass",
          at: "2026-08-12T11:14:11Z",
          notes: "CODEX-002 verified.",
        },
      },
      backlog,
    );

    expect(output).toContain("Validation: pass at 2026-08-12T11:14:11Z — npm run validate");
    expect(output).toContain("Verifier: pass at 2026-08-12T11:14:11Z — CODEX-002 verified.");
    expect(output).not.toContain("Validation: not run");
    expect(output).toContain("Tasks: 2 done | 1 in progress | 0 remaining");
  });

  it("continues to understand the legacy status/summary evidence shape", () => {
    const output = formatStatus(
      {
        projectStatus: "blocked",
        currentTaskId: "TASK-1",
        iteration: 3,
        lastValidation: { status: "fail", summary: "Browser test failed." },
        lastVerifier: null,
        blocker: { summary: "Credentials required." },
      },
      { tasks: [{ status: "todo" }] },
    );

    expect(output).toContain("Validation: fail — Browser test failed.");
    expect(output).toContain("Verifier: not run");
    expect(output).toContain("ACTION NEEDED: Credentials required.");
  });
});
