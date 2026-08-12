# Autonomous operating protocol

## Purpose

This protocol turns the product, test, and product-evolution contracts into a controlled autonomous loop. It is permission to independently improve the in-scope product; it is not permission to bypass protected product boundaries or external decisions.

## Initial review gate

The human reviews Harness v1 once: product scope, architecture, domain invariants, backlog order, validation contract, and this retry policy. On approval, make exactly this state transition in `.agent/state.json`:

```json
{
  "projectStatus": "active",
  "initialReview": { "status": "approved", "approvedAt": "<ISO-8601 timestamp>" }
}
```

Then start the approved autonomous agent from the repository with this prompt:

```text
Activate autonomous development for Save & Spend. Read AGENTS.md and all required contracts. Begin the highest-priority unblocked task. Continue the plan -> build -> validate -> browser test -> read-only verifier -> fix -> next-task loop until the MVP is complete or a documented genuine blocker occurs.
```

Codex uses the durable goal plus root `AGENTS.md` as its continuation contract. Cursor remains an optional compatible controller: it loads `AGENTS.md` and `.cursor/rules`, while `.cursor/hooks.json` registers its stop hook. Both use the same state and backlog and must never run concurrently in one checkout.

## Recommended run modes

- **Codex durable goal (current):** keep this repository's goal active across turns. Codex reads current state, generates evidence-backed work when needed, uses fresh read-only verifier subagents, and records validated commits. The user does not supply routine tasks.
- **Cursor IDE:** run the launch prompt in an agent chat only when Codex is not controlling the checkout. The stop hook handles normal turn-to-turn continuation.
- **Cursor CLI/controller:** use `bash scripts/run-autonomous.sh` only when Codex is not controlling the checkout. It persistently starts checkpointed Cursor sessions while the project remains `active`; an optional positive `SAVE_AND_SPEND_MAX_AUTONOMOUS_RUNS` value can impose a temporary operator-selected cap. If the CLI exits unexpectedly, it waits and resumes the saved Cursor session with exponential backoff. It stops normally only at `complete` or `blocked`; five consecutive CLI failures become a documented blocker.

The hook's `maxFollowupsPerRun` bounds a single Cursor session. It exists to force a fresh diagnosis/state checkpoint, not to declare the project complete. The persistent controller starts the next checkpointed session whenever state remains `active`, including when an empty backlog requires a fresh product-discovery cycle.

## State protocol

The agent owns `.agent/state.json` while active:

- Set `currentTaskId` before implementation.
- Record the plan, validation result, verifier result, strategy count, and concise evidence after each iteration.
- Mark a task done only after validation and verifier PASS.
- Keep the backlog and state consistent in the same coherent change.

## Verifier protocol

After every implementation attempt, spawn or invoke a fresh read-only verifier subagent using the prompt in `AGENTS.md`. It reviews requirements, the diff, validation artifacts, architecture boundaries, domain invariants, and browser evidence. It returns `PASS` or structured `FAIL`. The builder fixes all failures and asks for a new review; the verifier never patches the implementation.

Before returning PASS for a completed task, the verifier must also perform a harness-evolution review: did the task reveal a missing test, unclear requirement, inadequate validation, recurring failure mode, or weak operational control? If yes, it must require the builder to strengthen the harness and document it in `docs/HARNESS_EVOLUTION.md`. It must reject any apparent harness change that weakens safeguards or changes protected product policy without human approval.

## Retry and blocker policy

For any task failure:

1. Diagnose the failing evidence and attempt a focused fix.
2. If the same failure recurs twice, choose a materially different strategy (for example, isolate the domain logic, reproduce with a minimal test, inspect integration boundaries, or seek verifier analysis).
3. After **five failed iterations** or **three materially different strategies**, run a final verifier/repository-history review.
4. If the failure remains and requires unavailable credentials, a human product decision, an external service change, or an unresolved tool/environment fault, set `projectStatus` to `blocked` and record the reproducible blocker evidence.

Do not block for ordinary bugs, incomplete work, or uncertainty that can be resolved from the repository and documented rules.

## Completion criteria

Set `projectStatus` to `complete` only if:

- all backlog tasks are `done` and the product-discovery loop has no evidence-backed in-scope improvement required by `docs/RELEASE_READINESS.md`;
- `npm run validate` passes;
- required browser E2E tests pass with no relevant console/network errors;
- the final verifier returns PASS; and
- README and state evidence accurately describe the presentation-ready release.
