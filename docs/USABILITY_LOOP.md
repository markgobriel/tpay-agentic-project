# Autonomous usability-improvement loop

## Mission

Continuously make Save & Spend easier to understand and operate for a first-time user. The agent owns discovery, task creation, implementation, testing, self-critique, independent review, and follow-up work. It must not wait for the human to identify ordinary usability problems.

This mission remains inside the fixed mock-finance product envelope and domain rules. It authorizes interface and workflow improvements, not real banking, authentication, new financial formulas, deployment, or external services.

## Required clarity audit

At the start of every usability discovery cycle, use the running product as a novice user on desktop and mobile. Inspect every visible section and complete the core goal workflow. Record evidence-backed findings for:

1. **Element identity:** buttons look clickable; inputs look editable; static text does not resemble a control; links, toggles, status messages, and labels are visually distinct.
2. **Action hierarchy:** one clear primary action per context; secondary actions are quieter; disabled, loading, pressed, success, and error states are unmistakable.
3. **Labels and guidance:** every input has a persistent plain-language label, useful format/constraint guidance, and a nearby actionable error; required and optional meaning is clear.
4. **Typography and grouping:** headings, labels, values, helper text, and metadata have consistent roles; spacing and surfaces communicate which content belongs together.
5. **Financial comprehension:** balance, spending, savings pace, goal gap, and recommendation meaning can be understood without guessing or decoding jargon.
6. **Navigation and focus:** reading order and tab order are logical; focus is visible; touch targets are practical; no important interaction depends on hover.
7. **Responsive behavior:** no clipping, ambiguous wrapping, hidden values, dense controls, or horizontal overflow at narrow widths.
8. **Feedback and recovery:** loading, empty, validation, success, and failure states explain what happened and what the user can do next.
9. **Accessibility and resilience:** semantic roles and accessible names match visible meaning; contrast is sufficient; console/network failures are absent on the happy path.

## Agent-owned iteration protocol

For every cycle:

1. Capture the current product and walk through it as a first-time user before deciding what to change.
2. Write a blunt self-critique containing specific observed friction, severity, evidence, and the expected user outcome. Do not use vague goals such as "make it nicer."
3. Replenish `backlog/ideas.json`, score the findings, and promote the strongest reversible in-scope improvement into a small task with objective acceptance criteria.
4. Plan, implement, and add regression coverage.
5. Run `npm run validate`, then use Playwright as a user at desktop and mobile widths. Capture screenshots and test labels, focus, state changes, console/network errors, and overflow.
6. Compare the after evidence to the stated problem. Perform a second self-review and list anything still confusing, inconsistent, or visually ambiguous.
7. Ask a fresh read-only verifier to challenge both the implementation and the self-review. The verifier must inspect screenshots and attempt the flow, not merely read code.
8. Fix every supported finding and repeat validation/review until the task passes.
9. Commit the coherent task, then immediately begin another audit and create the next task if any meaningful issue remains.

The agent must prefer measurable usability outcomes over feature count or cosmetic churn. It may revise user-facing acceptance criteria and UI conventions when evidence supports greater clarity, but it must preserve protected domain, architecture, safety, and product-scope constraints.

## Completion standard

An empty backlog is not completion. The usability mission may return to `complete` only after:

- the full release-readiness gate passes;
- two consecutive fresh desktop/mobile audits find no unresolved high- or medium-severity usability issue;
- core first-use, goal editing, recommendations, transactions, loading/error recovery, keyboard, and responsive flows pass;
- the final self-critique explicitly lists remaining low-severity tradeoffs rather than hiding them; and
- a fresh independent verifier agrees that another in-scope iteration would be cosmetic churn rather than a meaningful usability improvement.

Block for the human only when progress requires a protected product decision, external authorization, credentials, paid service, actual deployment, or an environment failure that exhausted the retry policy.
