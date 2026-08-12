#!/usr/bin/env bash
set -u

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root" || exit 1

api_url="http://127.0.0.1:3001/health"
web_url="http://127.0.0.1:5173/"
api_log=".agent/logs/preview-api.log"
web_log=".agent/logs/preview-web.log"
postgres_log=".agent/logs/preview-postgres.log"
postgres_env=".agent/preview-postgres.env"
postgres_ready=".agent/preview-postgres.ready"
postgres_pid_file=".agent/preview-postgres.pid"
api_pid=""
web_pid=""
postgres_pid=""
database_url=""

mkdir -p .agent/logs

cleanup() {
  lsof -tiTCP:3001 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  if [[ -n "$postgres_pid" ]] && kill -0 "$postgres_pid" 2>/dev/null; then
    kill "$postgres_pid" 2>/dev/null || true
    wait "$postgres_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT
trap 'exit 0' INT TERM

healthy() {
  curl --connect-timeout 1 --max-time 2 -sf "$1" >/dev/null 2>&1
}

start_api() {
  if [[ -z "$database_url" ]]; then
    return
  fi
  if [[ -n "$api_pid" ]] && kill -0 "$api_pid" 2>/dev/null; then
    return
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restarting live API" >>"$api_log"
  DATABASE_URL="$database_url" \
  CALCULATION_DATE="${CALCULATION_DATE:-2026-07-15T12:00:00.000Z}" \
    npm run dev -w @save-and-spend/api >>"$api_log" 2>&1 &
  api_pid=$!
}

start_postgres() {
  if [[ -n "$postgres_pid" ]] && kill -0 "$postgres_pid" 2>/dev/null; then
    return
  fi

  if [[ -n "$api_pid" ]] && kill -0 "$api_pid" 2>/dev/null; then
    kill "$api_pid" 2>/dev/null || true
  fi
  lsof -tiTCP:3001 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  api_pid=""
  database_url=""
  rm -f "$postgres_env" "$postgres_ready" "$postgres_pid_file"
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restarting local PostgreSQL" >>"$postgres_log"
  node packages/db/scripts/local-postgres.mjs \
    --name "save-spend-preview-$PPID-$$" \
    --mode stateless \
    --output-env "$postgres_env" \
    --ready-file "$postgres_ready" \
    --pid-file "$postgres_pid_file" \
    >>"$postgres_log" 2>&1 &
  postgres_pid=$!
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
  start_postgres
  if [[ -z "$database_url" && -f "$postgres_ready" && -f "$postgres_env" ]]; then
    database_url="$(sed -n 's/^DATABASE_URL=//p' "$postgres_env")"
    if [[ "$database_url" == postgres://* || "$database_url" == postgresql://* ]]; then
      DATABASE_URL="$database_url" npm run db:seed -w @save-and-spend/db >>"$postgres_log" 2>&1
    else
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) local PostgreSQL emitted an invalid URL" >>"$postgres_log"
      database_url=""
    fi
  fi
  healthy "$api_url" || start_api
  healthy "$web_url" || start_web
  sleep 3
done
