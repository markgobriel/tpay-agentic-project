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

### CODEX-002 — non-empty mobile activity regression

- **Observed evidence:** the existing mobile transaction test switched directly to an empty month, so it proved overflow only for the empty state. A live 390x844 audit exposed wrapped ISO dates, squeezed merchant names, and hidden category context in the populated state.
- **Safeguard added:** task-specific Playwright coverage now inspects populated desktop and mobile activity, asserts readable hierarchy and category/date visibility, preserves table/type semantics, checks page width and browser health, and captures focused screenshots. A unit test locks compact date formatting to UTC.
- **Enforced by:** `e2e/codex-002-mobile-activity.spec.ts`, `apps/web/src/formatTransactionDate.test.ts`, and `npm run validate`.
- **Scope:** presentation and regression coverage only; transaction data, financial meaning, APIs, and UTC policy remain unchanged.

### CODEX-003 — truthful status evidence

- **Observed evidence:** after CODEX-002, `.agent/state.json` recorded `result`, `at`, `notes`, and `command`, while `npm run status` read only nonexistent `status` and `summary` fields and falsely printed both gates as `not run`.
- **Safeguard added:** status formatting now consumes the current evidence schema, remains compatible with legacy fields, includes timestamps and useful detail, and is isolated behind pure formatting. The Vitest include contract now covers `scripts/**/*.test.mjs`; the initial self-review caught that harness tests were otherwise silently excluded.
- **Enforced by:** `scripts/status-format.mjs`, `scripts/status-format.test.mjs`, `scripts/status.mjs`, `vitest.config.ts`, and `npm run validate`.
- **Scope:** operational observability only; no product, financial, API, or autonomy-policy behavior changes.

### CODEX-004 — API request-boundary regressions

- **Observed evidence:** a direct malformed-JSON probe returned generic 500 even though the request was invalid, while oversized parser failures and unknown routes lacked explicit client-safe contract coverage. Responses also exposed `X-Powered-By: Express`.
- **Safeguard added:** API integration coverage now locks stable malformed JSON, payload-limit, unknown-route, content-type, and framework-header behavior at the Express boundary.
- **Enforced by:** `apps/api/src/app.ts`, `apps/api/src/api.integration.test.ts`, and `npm run validate`.
- **Scope:** request/error boundary reliability and metadata hardening only; finance resources, calculations, persistence, and product scope remain unchanged.

### CODEX-005 — executable architecture boundaries

- **Observed evidence:** `docs/ARCHITECTURE.md` defines strict web/API/domain/database/contracts dependency direction, but the single validation command only checked required file presence and could not reject forbidden cross-layer imports.
- **Safeguard added:** a dependency scanner detects workspace-package and relative cross-layer imports, applies layer-specific runtime allowlists, ignores test-only tooling, and has synthetic pass/fail regression tests.
- **Enforced by:** `scripts/architecture-rules.mjs`, `scripts/architecture-rules.test.mjs`, `scripts/check-architecture.mjs`, `npm run architecture:check`, and the final architecture stage of `npm run validate`.
- **Scope:** engineering boundary enforcement only; the approved modular-monolith architecture is encoded without changing it.

### DESIGN-002 — whole-layout authorship and hierarchy

- **Observed evidence:** the live desktop page treated nearly every concept as the same rounded translucent card, producing weak differentiation between overview, planning, recommendations, and details. The user explicitly rejected the result as bland and AI-generated.
- **Design response:** current finance-dashboard references and platform hierarchy guidance are distilled in `docs/DESIGN_REFERENCES.md`; the task requires an original composed workspace, not visual imitation.
- **Enforced by:** `docs/EXPERIENCE.md`, `docs/DESIGN_REFERENCES.md`, task-specific desktop/mobile Playwright evidence, `npm run validate`, and a fresh screenshot-aware verifier.
- **Scope:** presentation and interaction organization only; finance formulas, mock-data boundary, REST contracts, and modular-monolith direction remain fixed.

### CODEX-006 — browser-tooling supply-chain audit

- **Observed evidence:** a fresh full `npm audit` found high-severity advisory GHSA-7mvr-c777-76hp in both direct Playwright packages pinned by the lockfile at 1.54.2. The production-only audit reported zero vulnerabilities.
- **Safeguard added:** Playwright test/runtime packages move together to the current fixed stable release; the full dependency audit and every existing real-browser flow must pass before completion.
- **Enforced by:** `package.json`, `package-lock.json`, `npm audit`, the 19-test Playwright suite, `npm run validate`, and a fresh verifier.
- **Scope:** development/test supply-chain security only; product behavior, financial rules, API contracts, and application dependencies remain unchanged.

### CODEX-007 — hosted validation enforcement

- **Observed evidence:** the repository's local `npm run validate` gate was comprehensive, but no `.github` workflow ran it for pushes or pull requests, leaving published regressions without an automatic quality signal.
- **Safeguard added:** a read-only GitHub Actions job installs the exact lockfile, provisions Playwright's Chromium dependencies, and executes the unchanged single validation command. Official actions are pinned to immutable release commits; concurrency and timeout bound resource use.
- **Enforced by:** `.github/workflows/validate.yml`, `scripts/ci-workflow.test.mjs`, `scripts/validate.sh`, and `npm run validate`.
- **Scope:** hosted quality enforcement only; it does not push, publish, deploy, access secrets, or alter product/runtime behavior.

### CODEX-008 — whole-page accessibility regressions

- **Observed evidence:** browser coverage asserted individual labels, keyboard focus, responsive overflow, semantic tables/meters, and manually reviewed contrast, but no standards engine scanned the whole rendered page or progressive UI states.
- **Safeguard added:** the official axe Playwright integration scans default desktop/mobile plus expanded guide, open goal editor, and validation-error states against WCAG 2.0/2.1/2.2 A/AA and best-practice rules with no exclusions.
- **Enforced by:** `e2e/accessibility-audit.spec.ts`, the existing manual/interaction checks, and `npm run validate`.
- **Scope:** accessibility evidence and regression detection; automated scans complement rather than replace manual keyboard, visual, semantic, and inclusive-user review.

### CODEX-009 — transaction-direction comprehension regression

- **Observed evidence:** a fresh independent 390px novice audit found that mobile CSS visually hid Income/Expense while every transaction amount was unsigned, so unfamiliar merchants did not communicate money direction.
- **Safeguard added:** responsive browser coverage requires visible plain-language direction cues, explicit signed amounts, a friendly goal date, clean browser health, and no horizontal overflow on both desktop and mobile.
- **Enforced by:** `apps/web/src/formatTransactionAmount.test.ts`, `e2e/codex-009-transaction-direction.spec.ts`, the strengthened populated-activity test, and `npm run validate`.
- **Scope:** presentation semantics and comprehension only; persisted money, transaction types, APIs, formulas, and domain rules remain unchanged.

### CODEX-010 — truthful PostgreSQL and continuation enforcement

- **Observed evidence:** the approved architecture named PostgreSQL, but the provider, initial migration, client, integration tests, E2E, preview, and README runtime diagram were SQLite-specific. The release audit correctly rejected the deployment claim. The same audit cycle exposed continuation defects: an empty backlog in `codex_evolution` mode did not satisfy the Cursor hook's narrower discovery-mode list, status falsely implied a controller was always running, and a live Ctrl-C probe showed the preview supervisor cleaning up and immediately restarting instead of exiting. The first verifier also proved that npm workspace commands changed cwd and therefore ignored the README's repository-root `.env` when bare dotenv discovery was used.
- **Safeguard added:** PostgreSQL is now the sole Prisma schema/migration/adapter contract. Exact-pinned official local Prisma Postgres instances isolate database/API/browser validation without Docker or credentials. Executable policy tests reject provider/runtime drift. The runtime client and Prisma tooling resolve the documented root `.env` explicitly while exported values retain precedence. Continuation discovery is mode-independent for every active empty backlog, recognizes both current and legacy failure shapes, and has pure mutation-resistant tests; status uses controller-neutral wording. Preview startup validates its recorded process identity instead of trusting a stale PID, and INT/TERM now exit through the existing cleanup trap rather than returning to the supervision loop.
- **Enforced by:** PostgreSQL schema/migration/client, `packages/db/src/environment.ts`, root-environment and PostgreSQL policy tests, `packages/db/src/testing.ts`, `packages/db/scripts/local-postgres.mjs`, `scripts/e2e.sh`, preview scripts, narrowly scoped database dependency rules in `scripts/architecture-rules.mjs`, `scripts/continuation-policy.test.mjs`, hosted CI, and `npm run validate`.
- **Scope:** fulfills the already approved PostgreSQL modular-monolith direction and strengthens autonomous observability; financial formulas, mock product scope, REST contracts, and user-facing behavior remain unchanged.

### DEPLOY-001 — reproducible public Vercel handoff

- **Observed evidence:** the first provider build stopped with `project_settings_required` because the linked production settings had not been pulled. Vercel tooling also appended a broad `.env*` ignore after `!.env.example`, which could silently hide the committed environment template. After a successful provider build, the final local gate attempted to lint generated `.vercel/output` bundles even though deployment source remained correctly in scope. The ready deployment hostname was protected by SSO until the human supplied a public production alias.
- **Safeguard added:** the runbook now pulls production settings before building, uses the direct unpooled database URL for migration/seed, documents prebuilt publication and the canonical public URL, and limits ignored runtime artifacts without masking `.env.example`. ESLint continues to inspect `api/` and `server/` source while excluding only `.vercel/` and Playwright CLI generated output.
- **Enforced by:** `README.md`, `.gitignore`, `scripts/vercel-contract.test.mjs`, the Vercel provider build, public API probes, and headed desktop/mobile Chromium evidence.
- **Scope:** deployment reproducibility and repository hygiene only; product behavior, financial formulas, mock-data limits, and modular-monolith boundaries remain unchanged.

### DEPLOY-001 — deterministic shared-state browser validation

- **Observed evidence:** the post-deployment full gate ran multiple Playwright files concurrently against one deliberately isolated but shared PostgreSQL seed. Two simultaneous goal-save flows remained at “Saving goal…” until timeout while 21 other flows passed; the same write path passed in the public browser and had passed earlier local runs, exposing nondeterministic shared-record contention rather than a product expectation failure.
- **Safeguard added:** browser files now run with one worker when using the shared isolated E2E database, preventing concurrent goal mutations while retaining every assertion, viewport, and browser flow.
- **Enforced by:** `playwright.config.ts`, `scripts/postgres-contract.test.mjs`, `scripts/e2e.sh`, and `npm run validate`.
- **Scope:** test isolation and determinism only; no test is skipped, weakened, retried, or behaviorally changed.

### DEPLOY-001 — fresh-clone Prisma build ordering

- **Observed evidence:** the direct prebuilt deployment passed because local validation had already generated Prisma Client. After the verified commit reached GitHub, Vercel's clean clone compiled `apps/api` before the database workspace generated Prisma Client, so TypeScript could not resolve `PrismaClient` or model exports.
- **Safeguard added:** the root production build now generates Prisma Client before invoking workspace builds, making clean CI/Vercel builds independent of local generated state.
- **Enforced by:** the root `build` script, `scripts/vercel-contract.test.mjs`, local validation, and a fresh Git-triggered Vercel deployment.
- **Scope:** build ordering only; dependency versions, schema, API behavior, domain logic, and product scope are unchanged.
