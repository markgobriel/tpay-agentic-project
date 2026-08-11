# Save & Spend — Agentic Finance MVP

Save & Spend is a harness-engineering experiment for a mock personal-finance web app. The product models **one bank account** and helps a user understand spending and reach a savings goal.

## Status

Harness v1 is approved and product foundation work is underway. The repository is an npm workspaces modular monolith:

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
```

## Contracts

1. [Product scope](docs/PRODUCT.md)
2. [Architecture](docs/ARCHITECTURE.md)
3. [Financial domain rules](docs/DOMAIN_RULES.md)
4. [Testing strategy](docs/TESTING.md)
5. [Autonomy protocol](docs/AUTONOMY.md)

## Validation

Run the one repository validation command:

```bash
npm run validate
```

It currently runs harness/structure checks, format, lint, TypeScript, unit tests, and production builds. Integration and Playwright stages are added by later tasks.

## Autonomous development

After Harness v1 approval (`projectStatus: active`), use `bash scripts/run-autonomous.sh` for hands-off development. It refuses to run before approval and automatically starts up to 50 bounded Cursor runs, stopping early only when the state becomes `complete` or `blocked`.

## Foundation notes

- Monthly analysis timezone policy: **UTC** (selected in FOUND-001).
- Monetary amounts use non-negative integer minor units at domain and persistence boundaries.
- No finance product feature is complete until its backlog task is marked done with validation and verifier evidence.
