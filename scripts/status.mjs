#!/usr/bin/env node
import fs from "node:fs";

const state = JSON.parse(fs.readFileSync(".agent/state.json", "utf8"));
const backlog = JSON.parse(fs.readFileSync("backlog/tasks.json", "utf8"));
const counts = Object.groupBy(backlog.tasks, (task) => task.status);
const count = (status) => counts[status]?.length ?? 0;

console.log("Save & Spend autonomous status");
console.log(`Status: ${state.projectStatus.toUpperCase()}`);
console.log(`Current task: ${state.currentTaskId ?? "none"}`);
console.log(`Iteration: ${state.iteration}`);
console.log(
  `Tasks: ${count("done")} done | ${count("in_progress")} in progress | ${count("todo")} remaining`,
);
console.log(
  `Validation: ${state.lastValidation?.status ?? "not run"} — ${state.lastValidation?.summary ?? ""}`,
);
console.log(
  `Verifier: ${state.lastVerifier?.status ?? "not run"} — ${state.lastVerifier?.summary ?? ""}`,
);

if (state.projectStatus === "blocked") {
  console.log(
    `\nACTION NEEDED: ${state.blocker?.summary ?? "Read .agent/state.json for the documented blocker."}`,
  );
} else if (state.projectStatus === "complete") {
  console.log("\nCOMPLETE: all required validation and verification gates passed.");
} else {
  console.log("\nNo action needed from you. The controller continues automatically.");
}
