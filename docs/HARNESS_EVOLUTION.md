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

### QUALITY-001 — Playwright gate in validate

- **Observed evidence:** browser-validation scripts existed per feature task, but the repository gate could still pass without a durable E2E covering account → goal → recommendations, and Chromium launch was tied to a machine-specific path.
- **Safeguard added:** Playwright core-flow E2E, a11y/responsive evidence doc, `npm run test:e2e` wired after build in `validate`, portable Chromium install via `npx playwright install chromium` (optional `CHROME_PATH` override only).
- **Enforced by:** `e2e/core-flow.spec.ts`, `playwright.config.ts`, `scripts/e2e.sh`, `scripts/validate.sh`, `docs/QUALITY_EVIDENCE.md`.
- **Scope:** strengthens release evidence and CI portability; does not change product financial policy.
