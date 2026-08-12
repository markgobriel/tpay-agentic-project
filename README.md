# Save & Spend — Agentic Finance MVP

Save & Spend is a harness-engineering experiment for a mock personal-finance web app. The product models **one bank account** and helps a user understand spending and reach a savings goal.

## Status

Presentation-ready for local demo and portfolio review against the [release-readiness gate](docs/RELEASE_READINESS.md). The mock one-account app includes dashboard analytics, accessible category spending bars, savings-goal pace, discretionary recommendations, first-use demo guidance, deliberate loading/empty/error feedback, and Playwright-covered flows. External publication or production deployment remains a human-authorized action. This repository is an npm workspaces modular monolith:

```text
apps/
  web/                 React + TypeScript frontend (Vite)
  api/                 Node + TypeScript REST API (Express)
packages/
  domain/              deterministic financial rules and services
  db/                  Prisma schema, migrations, seed data
  contracts/           shared API request/response contracts
docs/                  product and engineering contract
backlog/               machine-readable work queue
.agent/                autonomous-loop state
.cursor/               Cursor rules and lifecycle hooks
scripts/               validation and orchestration helpers
e2e/                   Playwright core user-flow coverage
```

## Contracts

1. [Product scope](docs/PRODUCT.md)
2. [Architecture](docs/ARCHITECTURE.md)
3. [Financial domain rules](docs/DOMAIN_RULES.md)
4. [Testing strategy](docs/TESTING.md)
5. [Autonomy protocol](docs/AUTONOMY.md)
6. [Harness evolution log](docs/HARNESS_EVOLUTION.md)
7. [Experience and visual design](docs/EXPERIENCE.md)
8. [Autonomous product evolution](docs/PRODUCT_EVOLUTION.md)
9. [Release-readiness gate](docs/RELEASE_READINESS.md)

## Local run

Requirements: Node.js 20+.

1. Install dependencies from the repo root:

```bash
npm install
```

2. Configure the database URL (SQLite for local/demo). Copy the example env and keep mock data only—never point this project at real bank credentials:

```bash
cp .env.example .env
```

`.env.example` sets `DATABASE_URL="file:./packages/db/dev.db"`. Optional: set `CALCULATION_DATE` (ISO-8601, e.g. `2026-07-15T12:00:00.000Z`) when starting the API to freeze goal/recommendation “today” for deterministic demos.

3. Generate Prisma client, create the local SQLite schema, and load the deterministic mock seed:

```bash
npm run db:generate -w @save-and-spend/db
npm run db:push -w @save-and-spend/db
npm run db:seed -w @save-and-spend/db
```

4. Start the API and web app (two terminals):

```bash
# Terminal A — API (optional CALCULATION_DATE for fixed analytics)
CALCULATION_DATE=2026-07-15T12:00:00.000Z npm run dev -w @save-and-spend/api

# Terminal B — Vite UI (proxies API routes)
npm run dev -w @save-and-spend/web
```

Open the Vite URL printed in the web terminal (typically `http://127.0.0.1:5173`).

For a continuously supervised live preview while the autonomous agent works, run `npm run preview:live`. The supervisor keeps the API on port 3001 and the hot-reloading web app on port 5173, restarting either if it is interrupted. Automated browser tests use isolated ports and an isolated test database, so they do not intentionally stop or reset the live preview.

### Demo tips

- Data is **seeded mock finance only** (one Everyday Checking account, July 2026 activity, one Emergency Fund goal).
- The dismissible **Demo walkthrough** explains the mock workflow; it is not financial advice.
- Goal pace and cut suggestions use a **calculation month** (from `CALCULATION_DATE`, or today when unset). The dashboard month picker can differ—if it does, the UI explains the mismatch and offers to align Monthly position.
- Default seed is on-pace for the Emergency Fund when `CALCULATION_DATE=2026-07-15…`. To see **discretionary cut suggestions**, raise the goal target or lower current saved until a savings gap appears, then save—the recommendations panel refreshes from the same rule-based engine (essentials are never cut). A gap with **$0 proposed cuts** means that calculation month has no discretionary spend to reduce, not that the gap is closed.

## Validation

Run the one repository validation command:

```bash
npm run validate
```

It currently runs harness/structure checks, format, lint, TypeScript, unit tests, production builds, and Playwright E2E (`npm run test:e2e`).

## Autonomous development

After Harness v1 approval (`projectStatus: active`), use `bash scripts/run-autonomous.sh` for hands-off development. It refuses to run before approval and persistently starts checkpointed Cursor runs, including agent-owned task discovery whenever the backlog empties. It stops normally only when the state becomes `complete` or `blocked`.

Run `npm run status` for a concise live readout of task, validation, verifier, and intervention status. The controller streams Cursor events into `.agent/logs/controller.ndjson`, which can be followed in the terminal while it works.

On macOS, the controller sends a desktop notification when the MVP is complete or when it reaches a genuine blocker. You do not need to poll the terminal for either outcome.

The agent does not merely follow the initial harness: after every task, it audits what it learned and autonomously strengthens tests, validation, operating rules, and documentation. Protected product scope and financial rules remain fixed unless a human explicitly changes them.

## Foundation notes

- Monthly analysis timezone policy: **UTC** (selected in FOUND-001).
- Monetary amounts use non-negative integer minor units at domain and persistence boundaries.
- Local/test persistence uses **SQLite** via Prisma (no Docker). Architecture still targets PostgreSQL for production deployment.
- Optional `CALCULATION_DATE` (ISO-8601) freezes API goal/recommendation analytics for deterministic local demos and browser evidence.
- Accessibility/responsive evidence: `docs/QUALITY_EVIDENCE.md`. Playwright E2E is part of `npm run validate`.
