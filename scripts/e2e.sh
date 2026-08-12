#!/usr/bin/env bash
# Start API + web, run Playwright E2E, then tear down.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
test_dir="$root/.agent/test"
db_file="$test_dir/e2e.db"
api_port=3101
web_port=4173

mkdir -p "$test_dir"

cleanup() {
  lsof -tiTCP:$api_port -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  lsof -tiTCP:$web_port -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
}
trap cleanup EXIT

cleanup
rm -f "$db_file"
sqlite3 "$db_file" < "$root/packages/db/prisma/migrations/20260811180000_init/migration.sql"
(
  cd "$root/packages/db"
  DATABASE_URL="file:$db_file" npx prisma db seed >/dev/null
)

DATABASE_URL="file:$db_file" \
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
