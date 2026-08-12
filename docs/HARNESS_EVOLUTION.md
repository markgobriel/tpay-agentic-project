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

### EVOLVE-002 — first-use demo guidance

- **Observed evidence:** first-time viewers lacked an explicit mock-data / workflow narrative required by release-readiness product clarity.
- **Safeguard added:** dismissible DemoGuide with factual mock/goal/discretionary copy and Playwright assert of dismiss persistence.
- **Enforced by:** `apps/web/src/DemoGuide.tsx`, `e2e/first-use-guide.spec.ts`, `npm run validate`.
- **Scope:** presentation/onboarding only; no finance math changes.

### EVOLVE-003 — state feedback evidence

- **Observed evidence:** RELEASE_READINESS required deliberate loading/empty/error feedback; panels had uneven placeholders and weak recoverable errors.
- **Safeguard added:** shared PanelMessage tones, dashboard/goal/recommendations Retry paths, goal save pending/success status, Playwright mocked failure + save status coverage.
- **Enforced by:** `apps/web/src/PanelMessage.tsx`, `App.tsx`, `SavingsGoalPanel.tsx`, `RecommendationsPanel.tsx`, `e2e/state-feedback.spec.ts`, `npm run validate`.
- **Scope:** UX reliability for demos; no domain formula changes.

### EVOLVE-004 — operational local-run documentation

- **Observed evidence:** RELEASE_READINESS required documented install/env/seed/run steps; README previously centered on validate/autonomy without a first-operator local-run path.
- **Safeguard added:** README Local run + demo tips; `.env.example` documents mock-only DATABASE_URL and optional CALCULATION_DATE.
- **Enforced by:** `README.md`, `.env.example`, release-readiness verifier review.
- **Scope:** operational documentation only; no product math changes.

### UX-001 — pace-month clarity and honest empty-cut copy

- **Observed evidence:** Novice audit `USABILITY-AUDIT-001` showed July monthly savings beside Behind-pace/$12,200 gap figures driven by an unnamed August `analyticsYearMonth`, plus copy claiming “No discretionary cuts needed” while the unresolved gap remained.
- **Safeguard added:** Plain-language calculation-month labels, mismatch banner with one-click month align, gap>0 empty-recommendation honesty, secondary Got it / primary Save goal hierarchy, money format helper, Playwright regression coverage, and eslint browser globals for one-shot audit scripts.
- **Enforced by:** `apps/web/src/App.tsx`, `SavingsGoalPanel.tsx`, `RecommendationsPanel.tsx`, `DemoGuide.tsx`, `formatYearMonth.ts`, `e2e/ux-001-pace-month.spec.ts`, `eslint.config.js`, `npm run validate`.
- **Scope:** Presentation and guidance only; no domain formula or API contract changes.

### UX-002 — plain-language recommendation explanations

- **Observed evidence:** UX-001 self-review and recommendation screenshots showed user-visible “4500 minor units” domain strings beside already-formatted dollar cut amounts.
- **Safeguard added:** Presentation helper builds currency explanations from existing API minor fields; Playwright asserts no “minor units” / raw minor integers in visible copy.
- **Enforced by:** `apps/web/src/recommendationCopy.ts`, `recommendationCopy.test.ts`, `RecommendationsPanel.tsx`, `e2e/ux-002-recommendation-copy.spec.ts`, `npm run validate`.
- **Scope:** Presentation copy only; recommendation math and API payloads unchanged.

### UX-003 — month-scoped transaction history

- **Observed evidence:** UX-001 audit showed July rows while Monthly position was set to empty August, so novices could not tell which month the activity belonged to.
- **Safeguard added:** Presentation filter by selected `YYYY-MM`, plain-language activity label, empty state for months without rows, and Playwright month-switch coverage.
- **Enforced by:** `apps/web/src/filterTransactionsByMonth.ts`, `App.tsx`, `e2e/ux-003-transactions-month.spec.ts`, `npm run validate`.
- **Scope:** Presentation filtering of existing transactions payload; no API/domain formula changes.

### UX-004 — field-adjacent goal validation errors

- **Observed evidence:** AUDIT-002 found medium severity: client validation errors rendered above pace metrics, away from the form controls.
- **Safeguard added:** Split load vs form errors; form validation/save failures render inside the goal form above Save goal with non-color-only error chrome; Playwright asserts vertical placement.
- **Enforced by:** `apps/web/src/SavingsGoalPanel.tsx`, `styles.css` `.form-error`, `e2e/ux-004-goal-form-errors.spec.ts`, `npm run validate`.
- **Scope:** Presentation/error placement only; no domain changes.

### Live-preview continuity

- **Observed evidence:** `scripts/e2e.sh` killed the same API/web ports and reset the same database used by the human's live preview, making the app disappear during autonomous validation.
- **Safeguard added:** supervised hot-reloading preview on ports 3001/5173 plus isolated E2E ports 3101/4173 and `.agent/test/e2e.db`.
- **Enforced by:** `scripts/ensure-preview.sh`, `scripts/preview-supervisor.sh`, `scripts/run-autonomous.sh`, `scripts/e2e.sh`, and `apps/web/vite.config.ts`.
- **Scope:** local development observability and test isolation only; no product or financial behavior changes.

### CODEX-001 — first-viewport hierarchy regression

- **Observed evidence:** a fresh 390x844 novice audit showed the always-expanded guide occupying nearly the entire first viewport. The existing guide test asserted visibility and overflow but did not protect the intended balance-first hierarchy.
- **Safeguard added:** the browser test now requires the balance panel to remain in the first mobile viewport, verifies the guide's collapsed and expanded states, and preserves dismissal persistence and financial-advice copy coverage.
- **Enforced by:** `apps/web/src/DemoGuide.tsx`, `e2e/first-use-guide.spec.ts`, and `npm run validate`.
- **Scope:** strengthens first-use presentation regression coverage; it does not change financial policy, calculations, or API contracts.
