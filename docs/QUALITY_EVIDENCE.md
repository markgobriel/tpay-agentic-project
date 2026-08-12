# QUALITY-001 accessibility and responsive evidence

Automated coverage lives in `e2e/core-flow.spec.ts` (run via `npm run test:e2e` / `npm run validate`).

## Keyboard and labels

- Month selector exposes an accessible name via `aria-label="Selected UTC month"` and is focused in E2E.
- Savings-goal fields use associated `<label>` text (Goal name, Target amount, Current saved, Target date).
- Primary actions and status use semantic roles (`role="alert"`, `role="status"`, heading levels).
- Transaction history uses a `<table>` with column headers (`scope="col"`).

## Responsive behavior

- CSS at `max-width: 640px` tightens shell padding and hides the transaction Category column on narrow viewports.
- E2E resizes to 390×844 after the core flow and asserts balance + recommendations remain visible.

## Browser console / network

- E2E fails if page console errors or HTTP ≥400 responses occur during the account → goal → recommendations path.
