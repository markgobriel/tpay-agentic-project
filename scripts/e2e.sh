#!/usr/bin/env bash
# Start API + web, run Playwright E2E, then tear down.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
db_file="$root/packages/db/dev.db"

cleanup() {
  lsof -tiTCP:3001 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
  lsof -tiTCP:5173 -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null || true
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
  npm run start -w @save-and-spend/api >/tmp/save-spend-api-e2e.log 2>&1 &

npm run dev -w @save-and-spend/web >/tmp/save-spend-web-e2e.log 2>&1 &

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:3001/health" >/dev/null \
    && curl -sf "http://127.0.0.1:5173/" >/dev/null; then
    break
  fi
  sleep 0.5
done

curl -sf "http://127.0.0.1:3001/health" >/dev/null \
  || { echo "API failed to become healthy"; cat /tmp/save-spend-api-e2e.log; exit 1; }
curl -sf "http://127.0.0.1:5173/" >/dev/null \
  || { echo "Web failed to become ready"; cat /tmp/save-spend-web-e2e.log; exit 1; }

npx playwright install chromium
npx playwright test
