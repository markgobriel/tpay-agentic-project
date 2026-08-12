# Architecture contract

## Shape

Save & Spend will be a TypeScript modular monolith in one repository:

```text
React web client -> REST API -> application/domain services -> Prisma -> PostgreSQL
```

## Technology decisions

| Area                    | Decision                                          |
| ----------------------- | ------------------------------------------------- |
| Web                     | React + TypeScript                                |
| Server                  | Node.js + TypeScript                              |
| API                     | REST and JSON                                     |
| Data                    | PostgreSQL via Prisma                             |
| Unit/UI testing         | Vitest + React Testing Library                    |
| API integration testing | Vitest + Supertest or equivalent HTTP test client |
| Browser E2E             | Playwright                                        |
| CI                      | GitHub Actions running `npm run validate`         |

Local development and validation use Prisma's exact-pinned local PostgreSQL runtime, powered by PGlite. This is a development/test convenience, not a second database contract: the authoritative Prisma provider, migration SQL, driver adapter, and connection protocol are PostgreSQL in every environment.

## Future module boundaries

```text
apps/web             presentation and browser-only concerns
apps/api             routes, request validation, dependency composition
packages/domain      money, categories, analytics, goals, recommendations
packages/db          Prisma schema, migrations, repositories, mock seed data
packages/contracts   API request/response contracts shared without server leakage
```

## Dependency direction

- Web may depend on contracts, never database or Prisma.
- API routes may depend on application/domain services and contracts, never React.
- Domain must not depend on React, HTTP, Prisma, or PostgreSQL.
- Database code implements persistence interfaces; it must not contain business policy.
- Controllers/routes coordinate input and output only. They do not calculate summaries, goals, pace, or recommendations.

## API design principles

Use predictable resources and explicit response models. Initial endpoints will cover account summary, transactions, monthly analytics, one savings goal, and goal recommendations. Validate requests at the API boundary and return client-safe errors. API details are deferred until the related foundation task so they can be tested against actual contracts.

## Data-model intent

The future schema will include Account, Transaction, and SavingsGoal. Transactions store amount, type, category, merchant, occurred date, and account relation. Store all monetary values in integer minor units (or a proved decimal-safe equivalent); do not use floating-point currency.

## Timezone policy

Monthly analysis uses the transaction `occurredAt` instant interpreted in **UTC** calendar months. This policy was selected during FOUND-001 and is exported from `packages/domain` as `ANALYSIS_TIMEZONE`.
