#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

pid_file=".agent/preview-supervisor.pid"
log_file=".agent/logs/preview-supervisor.log"
mkdir -p .agent/logs

if [[ -f "$pid_file" ]]; then
  supervisor_pid="$(tr -cd '0-9' <"$pid_file")"
  supervisor_command="$(ps -p "$supervisor_pid" -o command= 2>/dev/null || true)"
  if [[ -n "$supervisor_pid" ]] \
    && kill -0 "$supervisor_pid" 2>/dev/null \
    && [[ "$supervisor_command" == *"scripts/preview-supervisor.sh"* ]]; then
    echo "Live preview supervisor is already running (PID $supervisor_pid)."
    exit 0
  fi
fi

nohup bash scripts/preview-supervisor.sh >>"$log_file" 2>&1 &
supervisor_pid=$!
echo "$supervisor_pid" >"$pid_file"
echo "Started live preview supervisor (PID $supervisor_pid)."
