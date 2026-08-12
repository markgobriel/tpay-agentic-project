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

## Repository architecture

### System shape

Save & Spend is a modular monolith: the browser application, REST API, financial domain, persistence layer, and shared contracts live in one repository and are released together, while their dependency boundaries remain explicit.

```text
React browser client
        │ REST/JSON
        ▼
Express API routes
        ▼
Application service
        ├── deterministic domain calculations
        └── Prisma repositories
                    ▼
              local SQLite database
```

SQLite keeps local development and automated tests self-contained. Prisma is the persistence boundary, so the intended production database can be PostgreSQL without moving financial policy into database queries.

### Product modules

| Location             | Responsibility                                                                                                                                                                      | Important entry points                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/web`           | React presentation, browser state, API calls, responsive layout, accessible interaction, and user feedback. It may use shared contracts, but never imports Prisma or database code. | `src/main.tsx`, `src/App.tsx`, `src/api.ts`, `src/styles.css` |
| `apps/api`           | Express routes, request validation, dependency composition, and mapping domain/database results into API responses. Routes coordinate work but do not contain financial formulas.   | `src/index.ts`, `src/app.ts`, `src/finance-service.ts`        |
| `packages/domain`    | Framework-independent financial truth: monthly analytics, UTC date rules, goal projection, category policy, money validation, and deterministic spending recommendations.           | `src/analytics.ts`, `src/goals.ts`, `src/recommendations.ts`  |
| `packages/db`        | Prisma client, schema, migrations, repositories, and deterministic mock seed data. It stores and retrieves records but does not decide financial policy.                            | `prisma/schema.prisma`, `src/repositories.ts`, `src/seed.ts`  |
| `packages/contracts` | TypeScript request and response models shared by the web and API packages, preventing the two sides from silently disagreeing about payload shapes.                                 | `src/index.ts`                                                |

The intended dependency direction is:

```text
apps/web ───────────────► packages/contracts

apps/api ───────────────► packages/contracts
   │
   ├────────────────────► packages/domain
   └────────────────────► packages/db ─────► Prisma

packages/domain ────────► no web, HTTP, or database framework
```

### Typical request flow

For example, when the dashboard requests savings recommendations:

1. A React component calls `fetchRecommendations()` in `apps/web/src/api.ts`.
2. Vite proxies the browser request to the Express API during local development.
3. `apps/api/src/app.ts` matches the `/recommendations` route.
4. `apps/api/src/finance-service.ts` loads the account, transactions, and savings goal through `packages/db` repositories.
5. The service passes plain values into `packages/domain`, which calculates the savings gap and eligible discretionary reductions deterministically.
6. The API returns a response shaped by `packages/contracts` and React renders it with explicit loading, empty, success, or error feedback.

### Frontend composition

`apps/web/src/App.tsx` is the dashboard coordinator. User-facing areas are split into focused components such as:

- `SavingsGoalPanel.tsx` for editing the goal and presenting pace;
- `RecommendationsPanel.tsx` for deterministic spending reductions;
- `CategoryBreakdown.tsx` for accessible category visualization;
- `DemoGuide.tsx` for first-use guidance; and
- `PanelMessage.tsx` for consistent loading, empty, error, and recovery states.

Small formatting and input helpers live beside the components and have adjacent Vitest files. Global visual tokens, responsive behavior, control states, and the Apple-inspired presentation are defined in `apps/web/src/styles.css`.

### Tests and quality gates

Testing follows the same boundaries as the application:

- domain unit tests prove financial formulas and edge cases without HTTP or a database;
- database tests verify migrations, repositories, and deterministic seed data;
- API integration tests exercise Express against an isolated database;
- helper tests cover browser-side formatting and input conversion; and
- `e2e/` Playwright tests operate the complete application at desktop and mobile sizes, including keyboard focus, validation, recovery states, console/network failures, overflow, and screenshot evidence.

`npm run validate` is the single quality gate. It runs formatting checks, linting, TypeScript checks, unit/integration tests, production builds, and Playwright E2E. E2E uses isolated ports and a separate test database, so validation does not intentionally reset the live preview.

### Autonomous-development harness

The application code is surrounded by a repository-local agent harness. This infrastructure is intentionally versioned because it defines how autonomous changes are selected, tested, reviewed, and stopped:

| Location                    | Purpose                                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                 | Governing implementation, validation, verifier, safety, and continuation rules.                                                               |
| `docs/`                     | Product scope, architecture, financial invariants, experience standards, testing policy, autonomy protocol, usability loop, and release gate. |
| `backlog/tasks.json`        | Machine-readable work history and acceptance criteria.                                                                                        |
| `backlog/ideas.json`        | Agent-owned discovery pool from which new tasks are promoted.                                                                                 |
| `.agent/state.json`         | Current `ACTIVE`, `COMPLETE`, or `BLOCKED` status, plan, validation, verifier result, and evidence references.                                |
| `.cursor/`                  | Persistent Cursor project rules and the continuation hook.                                                                                    |
| `scripts/run-autonomous.sh` | Resilient controller that runs the plan → build → test → review → fix → next-task loop.                                                       |
| `scripts/ensure-preview.sh` | Starts the supervised hot-reloading local preview.                                                                                            |

Files under `.agent/logs/`, `.agent/evidence/`, and `.agent/test/` are generated operational artifacts. They help with observability and review but are not application modules or sources of financial truth.

## Contracts

1. [Product scope](docs/PRODUCT.md)
2. [Architecture](docs/ARCHITECTURE.md)
3. [Financial domain rules](docs/DOMAIN_RULES.md)
4. [Testing strategy](docs/TESTING.md)
5. [Autonomy protocol](docs/AUTONOMY.md)
6. [Harness evolution log](docs/HARNESS_EVOLUTION.md)
7. [Experience and visual design](docs/EXPERIENCE.md)
8. [Autonomous product evolution](docs/PRODUCT_EVOLUTION.md)
9. [Autonomous usability loop](docs/USABILITY_LOOP.md)
10. [Release-readiness gate](docs/RELEASE_READINESS.md)

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
- The compact **Guided demo** explains the mock workflow on demand; it is not financial advice.
- Goal pace and cut suggestions use a **calculation month** (from `CALCULATION_DATE`, or today when unset). The dashboard month picker can differ—if it does, the UI explains the mismatch and offers to align Monthly position.
- Default seed is on-pace for the Emergency Fund when `CALCULATION_DATE=2026-07-15…`. To see **discretionary cut suggestions**, raise the goal target or lower current saved until a savings gap appears, then save—the recommendations panel refreshes from the same rule-based engine (essentials are never cut). A gap with **$0 proposed cuts** means that calculation month has no discretionary spend to reduce, not that the gap is closed.

## Validation

Run the one repository validation command:

```bash
npm run validate
```

It currently runs harness/structure checks, format, lint, TypeScript, unit tests, production builds, and Playwright E2E (`npm run test:e2e`).

GitHub Actions runs this exact command for pull requests and pushes to `main`. The workflow is read-only, installs dependencies from the lockfile with `npm ci`, and provisions the matching Playwright Chromium system dependencies; it does not deploy or publish the app.

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
