#!/usr/bin/env bash
set -euo pipefail

# Persistent controller for Cursor CLI runs. It does not decide product work:
# AGENTS.md, state, and the agent-owned backlog/idea pool do. By default it runs
# until the state becomes complete or blocked. Operators can still set a
# positive SAVE_AND_SPEND_MAX_AUTONOMOUS_RUNS value for a temporary run cap.
max_runs="${SAVE_AND_SPEND_MAX_AUTONOMOUS_RUNS:-0}"
agent_bin="${CURSOR_AGENT_BIN:-}"
log_file=".agent/logs/controller.ndjson"
retry_delay_seconds=30
max_retry_delay_seconds=300
consecutive_cli_failures=0

project_status="$(node -p 'require("./.agent/state.json").projectStatus')"
if [[ "$project_status" != "active" ]]; then
  echo "Refusing to start: projectStatus is $project_status. Complete the initial Harness v1 review before enabling autonomous work." >&2
  exit 1
fi

notify() {
  node scripts/notify.mjs "$1" "$2" || echo "Desktop notification could not be delivered." >&2
}

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

prompt="Activate autonomous usability evolution for Save & Spend. Read AGENTS.md and every required contract, especially docs/USABILITY_LOOP.md and docs/EXPERIENCE.md. Operate the current app as a novice user, write a blunt evidence-backed self-critique, and create the highest-value usability task yourself. Improve clarity, action hierarchy, button/input/text/label distinction, plain-language guidance, feedback, accessibility, and desktop/mobile ease of use. For every task: plan, implement, validate, browser-test as a user, compare screenshots, self-review again, obtain a fresh read-only verifier challenge, fix every supported finding, commit, and immediately begin the next audit. Replenish the idea pool whenever needed. Do not wait for human tasks or routine feedback. Stop only after the full release-readiness gate and two consecutive clean usability audits pass, or a documented blocker genuinely requires human authority."

mkdir -p "$(dirname "$log_file")"
bash scripts/ensure-preview.sh

mark_blocked() {
  local message="$1"
  node -e '
    const fs = require("fs");
    const statePath = ".agent/state.json";
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    state.projectStatus = "blocked";
    state.blocker = { kind: "cursor-cli", summary: process.argv[1], recordedAt: new Date().toISOString() };
    fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  ' "$message"
  notify "Save & Spend needs your input" "$message"
}

run=1
resume_previous_session="${SAVE_AND_SPEND_RESUME_PREVIOUS_SESSION:-false}"
while ((max_runs == 0 || run <= max_runs)); do
  bash scripts/ensure-preview.sh
  status="$(node -p 'require("./.agent/state.json").projectStatus')"
  if [[ "$status" != "active" ]]; then
    if [[ "$status" == "complete" ]]; then
      notify "Save & Spend is complete" "All backlog tasks, validation, browser checks, and final verifier review passed."
    elif [[ "$status" == "blocked" ]]; then
      blocker_summary="$(node -p 'require("./.agent/state.json").blocker?.summary ?? "Read .agent/state.json for the blocker."')"
      notify "Save & Spend needs your input" "$blocker_summary"
    fi
    echo "Controller stopped: projectStatus is $status."
    exit 0
  fi

  if ((max_runs == 0)); then
    echo "Starting autonomous Cursor run $run (persistent mode)."
  else
    echo "Starting autonomous Cursor run $run of $max_runs."
  fi
  set +e
  if [[ "$resume_previous_session" == true ]]; then
    "$agent_bin" --trust --force --sandbox enabled --continue -p "$prompt" --output-format stream-json --stream-partial-output | tee -a "$log_file"
  else
    "$agent_bin" --trust --force --sandbox enabled -p "$prompt" --output-format stream-json --stream-partial-output | tee -a "$log_file"
  fi
  agent_exit=${PIPESTATUS[0]}
  set -e

  if ((agent_exit != 0)); then
    ((consecutive_cli_failures += 1))
    if ((consecutive_cli_failures >= 5)); then
      mark_blocked "Cursor CLI exited unsuccessfully five times in a row. Check .agent/logs/controller.ndjson for the captured errors."
      echo "Controller stopped after repeated Cursor CLI failures."
      exit 1
    fi

    echo "Cursor CLI ended unexpectedly (attempt $consecutive_cli_failures/5). Retrying the same saved session in ${retry_delay_seconds}s when connectivity is available."
    sleep "$retry_delay_seconds"
    retry_delay_seconds=$((retry_delay_seconds * 2))
    ((retry_delay_seconds > max_retry_delay_seconds)) && retry_delay_seconds=$max_retry_delay_seconds
    resume_previous_session=true
    continue
  fi

  consecutive_cli_failures=0
  retry_delay_seconds=30
  npm run validate
  resume_previous_session=true
  ((run += 1))
done

echo "Configured controller run cap reached while the project is still active. Restart without SAVE_AND_SPEND_MAX_AUTONOMOUS_RUNS for persistent mode."
