# Autonomous product evolution

## Authority

The user has authorized the agent to independently evolve Save & Spend from the completed MVP into a presentation-ready product. The agent may discover, specify, prioritize, build, test, refine, and retire **in-scope** product ideas without waiting for feature-by-feature feedback.

The product envelope remains fixed:

- one mock bank account and generated/seeded data only;
- no sign-in, real banking connection, payments, credit, investment, or generative financial advice;
- deterministic, explainable financial calculations and the domain invariants in `DOMAIN_RULES.md`;
- React/TypeScript + Node/TypeScript + REST + Prisma modular monolith.

External publication, deployment, remote pushes, real credentials, paid services, or production data remain human-authorized actions. “Ready to deploy” means technically and presentationally ready; it does not authorize an actual deployment.

## Product discovery loop

After every completed task, reassess the product and release-readiness evidence. When the backlog has no ready task, that is a trigger for a new discovery cycle, not a reason to wait for a human or stop:

1. Inspect the current product, browser evidence, tests, defects, accessibility gaps, UX friction, and `backlog/ideas.json`.
2. Generate or refine candidate ideas that make the mock finance experience more useful, understandable, polished, and presentation-ready. Replenish the idea pool whenever viable candidates have been exhausted; the initial seeded ideas are not a finite roadmap.
3. Score each idea for user impact, presentation value, evidence of need, implementation risk, and fit with the product envelope.
4. Promote the best in-scope idea to a small backlog task only when it has objective acceptance criteria and a practical validation plan.
5. Run the normal plan → build → test → browser-as-user → verifier → fix → harness-evolution loop.
6. Repeat until the release-readiness gate passes.

For user-facing work, the discovery and completion cycle must also satisfy `docs/USABILITY_LOOP.md`. A prior presentation-ready decision does not override newly observed usability evidence or a new human-directed usability mission.

The human does not supply routine tasks. Each task completion must lead to the next ready task, a newly promoted agent-authored task, or a defensible `complete` decision backed by the full release-readiness gate. The loop may not stop merely because `backlog/tasks.json` or `backlog/ideas.json` is temporarily empty.

Do not add features merely to increase feature count. Prefer changes that make the financial story clearer, the workflow easier, the UI more coherent, or the product more credible in a demo.

## Independent decision rules

The agent may autonomously choose product improvements that are reversible, use mock data only, and fit the fixed product envelope. Examples include better financial visualizations, insightful but deterministic summaries, onboarding/microcopy, empty/loading/error states, responsive behavior, accessibility, information architecture, visual polish, demo-friendly seed scenarios, and developer/deployment readiness.

The agent must block for a human only if the idea would require a protected scope change, a real financial-data integration, a legal/compliance decision, an external account/credential, a paid service, or actual publication/deployment.
