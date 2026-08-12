# Release-readiness gate

Save & Spend is ready to deploy only when the autonomous agent can demonstrate all of the following:

1. **Product clarity:** a first-time viewer can quickly understand the account position, spending picture, savings goal, pace, and recommendations.
2. **Credible experience:** polished desktop and mobile UI, coherent visual system, helpful empty/loading/error states, accessible labels/focus, and no obvious interaction dead ends.
3. **Reliable behavior:** the complete validation suite, API tests, deterministic domain tests, and browser E2E flows pass with no relevant console or network errors.
4. **Evidence-backed quality:** the verifier passes a final review of product behavior, architecture, screenshots, accessibility/responsiveness, and unresolved risk.
5. **Operational readiness:** README explains local run/validation steps, environment configuration is documented, mock-data boundaries are clear, and no credentials or generated artifacts are accidentally committed.
6. **Usability convergence:** the repeated audit in `USABILITY_LOOP.md` has produced two consecutive independent desktop/mobile passes with no unresolved high- or medium-severity usability issue, and remaining low-severity tradeoffs are explicitly recorded.

## Decision protocol

After each product-evolution task, assess this gate. If an in-scope deficiency remains, add the highest-value follow-up task and continue. Mark `projectStatus: "complete"` only when every gate passes, including the usability-convergence evidence, and there is no well-supported in-scope improvement that is necessary for a confident presentation-ready release.
