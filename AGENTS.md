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
7. `docs/EXPERIENCE.md`
8. `docs/PRODUCT_EVOLUTION.md`, `docs/USABILITY_LOOP.md`, and `docs/RELEASE_READINESS.md`
9. `backlog/tasks.json`, `backlog/ideas.json`, and `.agent/state.json`

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
7. Ask a fresh read-only verifier subagent to inspect the diff and evidence; it must not implement the feature.
8. Fix every validated failure or verifier finding, then repeat validation.
9. Mark the task done only with passing evidence and update state/backlog atomically.
10. Commit the coherent change with its tests and immediately begin the next task or product-discovery cycle.

Never mark a task done merely because code compiles or a screen renders.

## Non-negotiable constraints

- Independently evolve the product within `docs/PRODUCT_EVOLUTION.md`; do not add real bank integrations, authentication, credit products, investment features, or generative financial advice.
- Preserve deterministic financial calculations and monetary precision requirements in `docs/DOMAIN_RULES.md`.
- Do not put domain calculations in React components, route handlers, or Prisma queries.
- Do not weaken, delete, skip, or rewrite tests to make validation pass. Repair the implementation or improve a test only when the test demonstrably conflicts with the written contract.
- Do not add a dependency without documenting why it is necessary in the task notes.
- Do not change the fixed product envelope, financial-domain invariants, approved architecture direction, or release-readiness gate without a human instruction. You may autonomously create and evolve in-scope user-visible acceptance criteria according to `docs/PRODUCT_EVOLUTION.md`.
- Preserve unrelated user changes. Never reset, force-push, or delete files outside the task scope.

## Autonomous harness evolution

The harness must improve as the project learns. After every task's implementation and before its final verifier review, perform a brief system audit: identify any ambiguity, missing regression test, insufficient validation step, repeated failure pattern, unsafe default, or unclear operational instruction that made the task harder or less reliable than it should have been.

When the audit identifies a supported improvement, make it autonomously in the same coherent change. This includes strengthening tests, validation scripts, browser checks, architecture-boundary checks, agent rules, task acceptance criteria, examples, runbooks, and observability. Do not wait for a human to request these improvements.

Every harness change must be recorded in `docs/HARNESS_EVOLUTION.md` with the observed evidence, the safeguard added, and where it is enforced. The verifier must inspect this record and reject a change that weakens a guardrail or disguises a product-policy change as a harness improvement.

The following require a genuine human decision and must instead become a documented blocker: changing MVP scope; changing financial formulas, essential/discretionary categories, money/date policy, or other domain invariants; making a material user-experience policy choice not implied by existing acceptance criteria; weakening/removing a validation gate or test; or replacing the approved stack/architecture direction.

## Autonomous product evolution

When no backlog task is ready, follow `docs/PRODUCT_EVOLUTION.md` rather than stopping. Replenish and maintain `backlog/ideas.json`, promote the strongest evidence-backed in-scope idea into a testable task, and continue the full loop. The human does not provide routine tasks. Every completed task must trigger the next ready task or a fresh discovery cycle. Reassess `docs/RELEASE_READINESS.md` after each evolution task. Do not mark the product complete merely because the current task or seeded idea list is exhausted; completion requires the full release-readiness gate to pass.

## Autonomous usability evolution

Treat `docs/USABILITY_LOOP.md` as an additional completion contract. Repeatedly operate the app as a novice user, critique the current experience, generate evidence-backed usability tasks, implement them, compare browser evidence, obtain a fresh read-only verifier review, fix findings, and begin the next audit without human prompting. Pay special attention to the visual distinction and wording of buttons, inputs, static text, labels, helper text, status messages, and primary versus secondary actions. Do not return to `complete` until the two-consecutive-clean-audits standard passes.

## Browser validation

For every task with `browserValidation: true`, start the application and use a real browser or Playwright to:

1. execute the acceptance flow;
2. verify displayed values against expected calculations;
3. check console errors and failed network requests;
4. check the relevant responsive and accessible interaction;
5. save the test/evidence reference in the task notes.

For every user-facing task, also follow `docs/EXPERIENCE.md`: test the flow as a user at desktop and mobile widths, inspect the visual hierarchy and interaction states, and capture screenshots as evidence. Functional correctness alone is not sufficient when an experience requirement exists.

## Failure and blockers

Follow the retry policy in `docs/AUTONOMY.md`. A test failure is work to diagnose, not a reason to stop. Escalate only a genuine blocker after the required independent strategies have failed, and record reproducible evidence in `.agent/state.json`.

## Verifier subagent prompt

Use a separate read-only subagent after implementation (Codex or Cursor, matching the active controller):

> You are the verifier. Do not edit files. Inspect the current task, diff, tests, validation results, architecture boundaries, domain invariants, and required browser evidence. Return PASS or FAIL. For FAIL, cite exact file locations, violated rule/acceptance criterion, evidence, and the smallest required corrective action.

The implementation agent owns all fixes; the verifier remains read-only.
