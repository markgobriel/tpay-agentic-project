# Harness evolution log

This is the permanent learning record for Save & Spend's autonomous engineering loop. The agent updates it whenever a task exposes a systemic weakness and it strengthens the harness to prevent the same class of problem later.

## Change record format

For every entry, record:

- **Observed evidence:** the ambiguity, failure, gap, or repeated reviewer concern.
- **Safeguard added:** the specific rule, test, validation step, check, or documentation improvement.
- **Enforced by:** exact file(s), test(s), or command(s) that make the safeguard effective.
- **Scope:** why the change strengthens engineering quality without changing product policy.

## Initial entries

### Harness v1 — initial contract

- **Observed evidence:** autonomous feature work needs objective product boundaries, tests, browser evidence, verifier review, retry limits, and a continuation protocol.
- **Safeguard added:** the initial `AGENTS.md`, product/domain/testing/autonomy contracts, machine-readable backlog/state, single validation command, verifier protocol, and Cursor continuation hook.
- **Enforced by:** `AGENTS.md`, `docs/*.md`, `backlog/tasks.json`, `.agent/state.json`, `scripts/validate.sh`, and `.cursor/hooks/continue-loop.mjs`.
- **Scope:** defines the development process; it does not implement or change a product capability.

### DESIGN-001 — experience evidence gate

- **Observed evidence:** visual UX work can pass functional E2E without proving hierarchy, invalid-input paths, overflow, or screenshot evidence against `docs/EXPERIENCE.md`.
- **Safeguard added:** dedicated Playwright experience suite with desktop/mobile screenshots, invalid/valid goal flows, focus and overflow checks; screenshots under `.agent/evidence/DESIGN-001/`.
- **Enforced by:** `e2e/design-experience.spec.ts`, `docs/EXPERIENCE.md`, `npm run test:e2e` / `scripts/validate.sh`.
- **Scope:** strengthens user-experience validation; does not change financial formulas or API contracts.
