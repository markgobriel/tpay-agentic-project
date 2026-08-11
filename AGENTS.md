# Save & Spend agent operating contract

This repository is designed for autonomous agent-driven development. Treat the documents listed below as executable product constraints, not optional background reading.

## Required reading order

Before changing code or marking a task complete, read:

1. `README.md`
2. `docs/PRODUCT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DOMAIN_RULES.md`
5. `docs/TESTING.md`
6. `docs/AUTONOMY.md`
7. `backlog/tasks.json` and `.agent/state.json`

## Review gate

If `.agent/state.json` has `projectStatus: "awaiting_initial_review"`, only work on the harness and documentation. Do **not** create product features. Begin product work only after the human changes the state to `active` as described in `docs/AUTONOMY.md`.

## Autonomous development loop

When the project is active, continue without asking for a human review between ordinary tasks:

1. Read state and choose the highest-priority unblocked task.
2. Read the task's linked acceptance criteria and the relevant architecture/domain rules.
3. Write a concise implementation plan in `.agent/state.json` or the task's `notes` field.
4. Implement one coherent task. Keep a modular-monolith boundary.
5. Add or update tests that prove the acceptance criteria.
6. Run `npm run validate` and the task's required browser checks.
7. Ask a verifier subagent to inspect the diff and evidence; it must not implement the feature.
8. Fix every validated failure or verifier finding, then repeat validation.
9. Mark the task done only with passing evidence and update state/backlog atomically.
10. Commit the coherent change with its tests and immediately begin the next task.

Never mark a task done merely because code compiles or a screen renders.

## Non-negotiable constraints

- Build only the approved MVP; do not add real bank integrations, authentication, credit products, investment features, or generative financial advice.
- Preserve deterministic financial calculations and monetary precision requirements in `docs/DOMAIN_RULES.md`.
- Do not put domain calculations in React components, route handlers, or Prisma queries.
- Do not weaken, delete, skip, or rewrite tests to make validation pass. Repair the implementation or improve a test only when the test demonstrably conflicts with the written contract.
- Do not add a dependency without documenting why it is necessary in the task notes.
- Do not modify the harness-level product scope, domain invariants, validation contract, retry policy, or completion criteria without a human instruction.
- Preserve unrelated user changes. Never reset, force-push, or delete files outside the task scope.

## Browser validation

For every task with `browserValidation: true`, start the application and use a real browser or Playwright to:

1. execute the acceptance flow;
2. verify displayed values against expected calculations;
3. check console errors and failed network requests;
4. check the relevant responsive and accessible interaction;
5. save the test/evidence reference in the task notes.

## Failure and blockers

Follow the retry policy in `docs/AUTONOMY.md`. A test failure is work to diagnose, not a reason to stop. Escalate only a genuine blocker after the required independent strategies have failed, and record reproducible evidence in `.agent/state.json`.

## Verifier subagent prompt

Use a separate Cursor subagent after implementation:

> You are the verifier. Do not edit files. Inspect the current task, diff, tests, validation results, architecture boundaries, domain invariants, and required browser evidence. Return PASS or FAIL. For FAIL, cite exact file locations, violated rule/acceptance criterion, evidence, and the smallest required corrective action.

The implementation agent owns all fixes; the verifier remains read-only.
