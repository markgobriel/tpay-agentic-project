function taskCounts(tasks) {
  return tasks.reduce(
    (counts, task) => {
      if (task.status in counts) counts[task.status] += 1;
      return counts;
    },
    { done: 0, in_progress: 0, todo: 0 },
  );
}

function evidenceLine(label, evidence) {
  if (!evidence) return `${label}: not run`;

  const result = evidence.result ?? evidence.status ?? "unknown";
  const detail = evidence.notes ?? evidence.summary ?? evidence.command;
  const timestamp = evidence.at ? ` at ${evidence.at}` : "";
  return `${label}: ${result}${timestamp}${detail ? ` — ${detail}` : ""}`;
}

export function formatStatus(state, backlog) {
  const counts = taskCounts(backlog.tasks);
  const lines = [
    "Save & Spend autonomous status",
    `Status: ${state.projectStatus.toUpperCase()}`,
    `Current task: ${state.currentTaskId ?? "none"}`,
    `Iteration: ${state.iteration}`,
    `Tasks: ${counts.done} done | ${counts.in_progress} in progress | ${counts.todo} remaining`,
    evidenceLine("Validation", state.lastValidation),
    evidenceLine("Verifier", state.lastVerifier),
  ];

  if (state.projectStatus === "blocked") {
    lines.push(
      "",
      `ACTION NEEDED: ${state.blocker?.summary ?? "Read .agent/state.json for the documented blocker."}`,
    );
  } else if (state.projectStatus === "complete") {
    lines.push("", "COMPLETE: all required validation and verification gates passed.");
  } else {
    lines.push("", "No action needed from you. The controller continues automatically.");
  }

  return lines.join("\n");
}
