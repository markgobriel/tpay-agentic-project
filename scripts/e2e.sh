#!/usr/bin/env bash
# Start API + web, run Playwright E2E, then tear down.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
test_dir="$root/.agent/test"
db_env="$test_dir/e2e-postgres.env"
db_ready="$test_dir/e2e-postgres.ready"
db_pid_file="$test_dir/e2e-postgres.pid"
api_port=3101
web_port=4173
postgres_pid=""

mkdir -p "$test_dir"

cleanup() {
  lsof -tiTCP:$api_port -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  lsof -tiTCP:$web_port -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  if [[ -n "$postgres_pid" ]] && kill -0 "$postgres_pid" 2>/dev/null; then
    kill "$postgres_pid" 2>/dev/null || true
    wait "$postgres_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

cleanup
rm -f "$db_env" "$db_ready" "$db_pid_file"

node packages/db/scripts/local-postgres.mjs \
  --name "save-spend-e2e-$PPID-$$" \
  --mode stateless \
  --output-env ".agent/test/e2e-postgres.env" \
  --ready-file ".agent/test/e2e-postgres.ready" \
  --pid-file ".agent/test/e2e-postgres.pid" \
  >/tmp/save-spend-postgres-e2e.log 2>&1 &
postgres_pid=$!

for _ in $(seq 1 120); do
  [[ -f "$db_ready" ]] && break
  kill -0 "$postgres_pid" 2>/dev/null \
    || { echo "Local PostgreSQL exited before becoming ready"; cat /tmp/save-spend-postgres-e2e.log; exit 1; }
  sleep 0.25
done
[[ -f "$db_ready" ]] \
  || { echo "Local PostgreSQL failed to become ready"; cat /tmp/save-spend-postgres-e2e.log; exit 1; }

database_url="$(sed -n 's/^DATABASE_URL=//p' "$db_env")"
[[ "$database_url" == postgres://* || "$database_url" == postgresql://* ]] \
  || { echo "Local PostgreSQL emitted an invalid database URL"; exit 1; }

(
  cd "$root/packages/db"
  DATABASE_URL="$database_url" npm run db:seed >/dev/null
)

DATABASE_URL="$database_url" \
CALCULATION_DATE="2026-07-15T12:00:00.000Z" \
PORT="$api_port" \
  npm run start -w @save-and-spend/api >/tmp/save-spend-api-e2e.log 2>&1 &

VITE_PORT="$web_port" \
VITE_API_TARGET="http://127.0.0.1:$api_port" \
  npm run dev -w @save-and-spend/web >/tmp/save-spend-web-e2e.log 2>&1 &

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:$api_port/health" >/dev/null \
    && curl -sf "http://127.0.0.1:$web_port/" >/dev/null; then
    break
  fi
  sleep 0.5
done

curl -sf "http://127.0.0.1:$api_port/health" >/dev/null \
  || { echo "API failed to become healthy"; cat /tmp/save-spend-api-e2e.log; exit 1; }
curl -sf "http://127.0.0.1:$web_port/" >/dev/null \
  || { echo "Web failed to become ready"; cat /tmp/save-spend-web-e2e.log; exit 1; }

npx playwright install chromium
WEB_URL="http://127.0.0.1:$web_port" npx playwright test
