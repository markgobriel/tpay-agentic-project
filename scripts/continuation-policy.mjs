export function validationFailed(lastValidation) {
  const result = lastValidation?.result ?? lastValidation?.status;
  return ["fail", "failed"].includes(result);
}

export function discoveryNeeded(state, tasks) {
  const unfinished = tasks.some((task) => ["todo", "in_progress"].includes(task.status));
  return state.projectStatus === "active" && !unfinished && !validationFailed(state.lastValidation);
}
