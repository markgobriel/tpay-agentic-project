# Save & Spend — Agentic Finance MVP

Save & Spend is a harness-engineering experiment for a mock personal-finance web app. The product models **one bank account** and helps a user understand spending and reach a savings goal.

## Status

MVP delivered. The mock one-account Save & Spend app is complete: dashboard analytics, savings-goal pace, discretionary recommendations, and Playwright-covered core flow. The repository is an npm workspaces modular monolith:

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

## Validation

Run the one repository validation command:

```bash
npm run validate
```

It currently runs harness/structure checks, format, lint, TypeScript, unit tests, production builds, and Playwright E2E (`npm run test:e2e`).

## Autonomous development

After Harness v1 approval (`projectStatus: active`), use `bash scripts/run-autonomous.sh` for hands-off development. It refuses to run before approval and automatically starts up to 50 bounded Cursor runs, stopping early only when the state becomes `complete` or `blocked`.

Run `npm run status` for a concise live readout of task, validation, verifier, and intervention status. The controller streams Cursor events into `.agent/logs/controller.ndjson`, which can be followed in the terminal while it works.

On macOS, the controller sends a desktop notification when the MVP is complete or when it reaches a genuine blocker. You do not need to poll the terminal for either outcome.

The agent does not merely follow the initial harness: after every task, it audits what it learned and autonomously strengthens tests, validation, operating rules, and documentation. Protected product scope and financial rules remain fixed unless a human explicitly changes them.

## Foundation notes

- Monthly analysis timezone policy: **UTC** (selected in FOUND-001).
- Monetary amounts use non-negative integer minor units at domain and persistence boundaries.
- Local/test persistence uses **SQLite** via Prisma (no Docker). Architecture still targets PostgreSQL for production deployment.
- Optional `CALCULATION_DATE` (ISO-8601) freezes API goal/recommendation analytics for deterministic local demos and browser evidence.
- Accessibility/responsive evidence: `docs/QUALITY_EVIDENCE.md`. Playwright E2E is part of `npm run validate`.
