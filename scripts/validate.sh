#!/usr/bin/env bash
set -euo pipefail

# Stable repository validation entry point.
# Order follows docs/TESTING.md: harness -> format -> lint -> types -> unit -> build.
# Integration and Playwright stages are added by later product tasks.

required_files=(
  "AGENTS.md"
  "docs/PRODUCT.md"
  "docs/ARCHITECTURE.md"
  "docs/DOMAIN_RULES.md"
  "docs/TESTING.md"
  "docs/AUTONOMY.md"
  "backlog/tasks.json"
  ".agent/state.json"
  ".cursor/hooks.json"
  ".cursor/hooks/continue-loop.mjs"
  "apps/web/package.json"
  "apps/api/package.json"
  "packages/domain/package.json"
  "packages/db/package.json"
  "packages/contracts/package.json"
  "packages/db/prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
  test -f "$file" || { echo "Missing required harness file: $file" >&2; exit 1; }
done

node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync(".agent/state.json", "utf8"));
  const backlog = JSON.parse(fs.readFileSync("backlog/tasks.json", "utf8"));
  if (!Array.isArray(backlog.tasks) || backlog.tasks.length === 0) throw new Error("Backlog must contain tasks.");
  if (!new Set(["awaiting_initial_review", "active", "blocked", "complete"]).has(state.projectStatus)) throw new Error("Invalid project status.");
  for (const task of backlog.tasks) {
    if (!task.id || !Number.isFinite(task.priority) || !Array.isArray(task.acceptanceCriteria)) throw new Error(`Invalid task: ${task.id ?? "unknown"}`);
  }
'

echo "==> format check"
npm run format:check

echo "==> lint"
npm run lint

echo "==> typecheck"
npm run typecheck

echo "==> unit tests"
npm run test

echo "==> build"
npm run build

echo "Validation passed."
