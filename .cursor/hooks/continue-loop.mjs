#!/usr/bin/env node
/**
 * Cursor stop hook for the autonomous loop.
 *
 * It is intentionally a continuation guard, not an implementation runner:
 * `state.json` remains the source of truth. Before product work is approved it
 * always permits the agent to stop. When active, it returns a follow-up prompt
 * only if unfinished work or failed validation remains and no safety stop is set.
 */
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const emit = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);

try {
  const input = await new Promise((resolve) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      raw += chunk;
    });
    process.stdin.on("end", () => {
      try {
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
  const state = readJson(".agent/state.json");
  const backlog = readJson("backlog/tasks.json");
  const unfinished = backlog.tasks.some((task) => ["todo", "in_progress"].includes(task.status));
  const validationFailed = state.lastValidation?.status === "failed";
  const discoveryNeeded =
    state.projectStatus === "active" &&
    ["product_evolution", "usability_evolution"].includes(state.autonomyMode) &&
    !unfinished &&
    !validationFailed;
  const stoppedForSafety = ["awaiting_initial_review", "blocked", "complete"].includes(
    state.projectStatus,
  );
  const loopCount = Number(input.loop_count ?? 0);
  const maxHookFollowups = Number(state.hookPolicy?.maxFollowupsPerRun ?? 12);

  if (stoppedForSafety) {
    emit({});
  } else if (loopCount >= maxHookFollowups) {
    emit({
      followup_message:
        "Autonomous-run safety limit reached. Re-read .agent/state.json and docs/AUTONOMY.md. If work remains, record a new run boundary or a genuine blocker with evidence; do not falsely mark work complete.",
    });
  } else {
    emit({
      followup_message: discoveryNeeded
        ? "The backlog is empty, so begin the next autonomous product and usability discovery cycle now. Follow docs/USABILITY_LOOP.md: operate the app as a novice, write an evidence-backed self-critique, replenish and score the idea pool, promote the strongest in-scope issue into a testable task, then build, validate, browser-test, compare screenshots, independently verify, fix, commit, and repeat. Do not wait for a human to supply tasks. Mark complete only after the full release-readiness gate and two consecutive clean usability audits pass."
        : "Continue the autonomous loop now: read state/backlog, take the highest-priority unblocked task or repair failing validation, run required tests and browser checks, obtain a read-only verifier review, update evidence/state, then proceed. Do not stop while work remains.",
    });
  }
} catch (error) {
  // A hook failure must never make Cursor loop indefinitely. The next run can
  // diagnose the hook through normal validation.
  emit({});
}
