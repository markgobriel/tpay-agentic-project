#!/usr/bin/env bash
set -euo pipefail

# A deliberately bounded controller for Cursor CLI runs. It does not decide
# product work: AGENTS.md, state, and the backlog do. It provides a safer
# alternative to an unbounded `while true` loop and works alongside the stop
# hook for agents launched from the Cursor IDE.

# A high but finite budget lets one launch progress through the whole MVP while
# retaining a hard recovery point against a runaway agent or unexpected cost.
max_runs="${SAVE_AND_SPEND_MAX_AUTONOMOUS_RUNS:-50}"
agent_bin="${CURSOR_AGENT_BIN:-}"

project_status="$(node -p 'require("./.agent/state.json").projectStatus')"
if [[ "$project_status" != "active" ]]; then
  echo "Refusing to start: projectStatus is $project_status. Complete the initial Harness v1 review before enabling autonomous work." >&2
  exit 1
fi

if [[ -z "$agent_bin" ]]; then
  if command -v agent >/dev/null 2>&1; then
    agent_bin="agent"
  elif command -v cursor-agent >/dev/null 2>&1; then
    agent_bin="cursor-agent"
  else
    echo "Cursor CLI was not found. Install it or set CURSOR_AGENT_BIN." >&2
    exit 1
  fi
fi

prompt="Activate autonomous development for Save & Spend. Read AGENTS.md and all required contracts. Continue the highest-priority unblocked task through plan, implementation, validation, required browser checks, read-only verifier review, fixes, backlog/state update, and the next task. Stop only for the documented safety or blocker conditions."

for ((run = 1; run <= max_runs; run++)); do
  status="$(node -p 'require("./.agent/state.json").projectStatus')"
  [[ "$status" == "active" ]] || { echo "Controller stopped: projectStatus is $status."; exit 0; }

  echo "Starting bounded autonomous Cursor run $run of $max_runs."
  "$agent_bin" --trust --force --sandbox enabled -p "$prompt"
  npm run validate
done

echo "Bounded controller run finished. Inspect .agent/state.json before starting another batch."
