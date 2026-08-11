# Autonomous operating protocol

## Purpose

This protocol turns the product and test contracts into a controlled autonomous loop. It is not permission to run indefinitely or bypass human decisions.

## Initial review gate

The human reviews Harness v1 once: product scope, architecture, domain invariants, backlog order, validation contract, and this retry policy. On approval, make exactly this state transition in `.agent/state.json`:

```json
{
  "projectStatus": "active",
  "initialReview": { "status": "approved", "approvedAt": "<ISO-8601 timestamp>" }
}
```

Then start Cursor from the repository with this prompt:

```text
Activate autonomous development for Save & Spend. Read AGENTS.md and all required contracts. Begin the highest-priority unblocked task. Continue the plan -> build -> validate -> browser test -> read-only verifier -> fix -> next-task loop until the MVP is complete or a documented genuine blocker occurs.
```

Cursor loads root `AGENTS.md` and `.cursor/rules`. The project `.cursor/hooks.json` registers the stop hook. The hook returns no continuation before approval, after completion, or when safety status is blocked; otherwise it sends a focused follow-up instruction rather than allowing an early stop.

## Recommended run modes

- **Cursor IDE:** run the launch prompt in an agent chat. The stop hook handles normal turn-to-turn continuation.
- **Cursor CLI/controller:** use `bash scripts/run-autonomous.sh` for hands-off development. It starts Cursor in trusted, force-approved, workspace-sandboxed non-interactive mode; the harness rules still prohibit destructive or out-of-scope actions. It runs up to 50 bounded Cursor sessions by default, checks state between them, and continues automatically while the project remains `active`. It stops early at `complete` or `blocked`. Do not replace this finite safety budget with an uncontrolled shell `while true` loop.

The hook's `maxFollowupsPerRun` bounds a single run. It exists to force a fresh diagnosis/state checkpoint, not to declare the project complete. A controller or intentional resumed run can safely start the next bounded run when state is still `active`.

## State protocol

The agent owns `.agent/state.json` while active:

- Set `currentTaskId` before implementation.
- Record the plan, validation result, verifier result, strategy count, and concise evidence after each iteration.
- Mark a task done only after validation and verifier PASS.
- Keep the backlog and state consistent in the same coherent change.

## Verifier protocol

After every implementation attempt, spawn or invoke a fresh read-only verifier subagent using the prompt in `AGENTS.md`. It reviews requirements, the diff, validation artifacts, architecture boundaries, domain invariants, and browser evidence. It returns `PASS` or structured `FAIL`. The builder fixes all failures and asks for a new review; the verifier never patches the implementation.

## Retry and blocker policy

For any task failure:

1. Diagnose the failing evidence and attempt a focused fix.
2. If the same failure recurs twice, choose a materially different strategy (for example, isolate the domain logic, reproduce with a minimal test, inspect integration boundaries, or seek verifier analysis).
3. After **five failed iterations** or **three materially different strategies**, run a final verifier/repository-history review.
4. If the failure remains and requires unavailable credentials, a human product decision, an external service change, or an unresolved tool/environment fault, set `projectStatus` to `blocked` and record the reproducible blocker evidence.

Do not block for ordinary bugs, incomplete work, or uncertainty that can be resolved from the repository and documented rules.

## Completion criteria

Set `projectStatus` to `complete` only if:

- all backlog tasks are `done` or intentionally removed by a human-approved scope decision;
- `npm run validate` passes;
- required browser E2E tests pass with no relevant console/network errors;
- the final verifier returns PASS; and
- README and state evidence accurately describe the delivered MVP.
