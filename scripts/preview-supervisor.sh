#!/usr/bin/env bash
set -u

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root" || exit 1

api_url="http://127.0.0.1:3001/health"
web_url="http://127.0.0.1:5173/"
api_log=".agent/logs/preview-api.log"
web_log=".agent/logs/preview-web.log"
api_pid=""
web_pid=""

mkdir -p .agent/logs

healthy() {
  curl --connect-timeout 1 --max-time 2 -sf "$1" >/dev/null 2>&1
}

start_api() {
  if [[ -n "$api_pid" ]] && kill -0 "$api_pid" 2>/dev/null; then
    return
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restarting live API" >>"$api_log"
  CALCULATION_DATE="${CALCULATION_DATE:-2026-07-15T12:00:00.000Z}" \
    npm run dev -w @save-and-spend/api >>"$api_log" 2>&1 &
  api_pid=$!
}

start_web() {
  if [[ -n "$web_pid" ]] && kill -0 "$web_pid" 2>/dev/null; then
    return
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restarting live web preview" >>"$web_log"
  npm run dev -w @save-and-spend/web -- --host 127.0.0.1 >>"$web_log" 2>&1 &
  web_pid=$!
}

while true; do
  healthy "$api_url" || start_api
  healthy "$web_url" || start_web
  sleep 3
done
