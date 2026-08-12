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

### EVOLVE-001 — category visualization evidence

- **Observed evidence:** the monthly spending story still relied on a flat list; demos needed a faster visual read without adding chart dependencies. An early mobile screenshot hid amount/share when meta stayed side-by-side.
- **Safeguard added:** CSS-only accessible category bars (`role="meter"`), integer share helper unit tests, stacked mobile meta so amount/share stay visible, and Playwright desktop/mobile screenshot plus bounding-box assertions.
- **Enforced by:** `apps/web/src/CategoryBreakdown.tsx`, `categoryShare.test.ts`, `e2e/category-visualization.spec.ts`, `npm run validate`.
- **Scope:** presentation clarity within the mock-finance envelope; no domain formula changes.
