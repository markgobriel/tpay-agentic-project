# Accessibility, responsive, and browser evidence

The Playwright suite under `e2e/` runs through `npm run test:e2e` and the single `npm run validate` gate. It operates the complete React/API/Prisma stack against an isolated local PostgreSQL instance and covers the default dashboard plus progressive interaction and failure states.

## Keyboard and labels

- Month selector exposes an accessible name via `aria-label="Selected UTC month"` and is keyboard reachable.
- Savings-goal fields use associated `<label>` text (Goal name, Target amount, Current saved, Target date).
- Primary actions, errors, and progress feedback use semantic controls and status roles (`role="alert"`, `role="status"`, headings, and meters).
- Transaction history remains a semantic `<table>` with scoped column headers at every width. Responsive styling changes visual composition without removing type/category meaning from the accessibility tree.
- Whole-page axe scans cover default desktop/mobile, expanded guidance, the goal editor, and invalid-form feedback with no excluded regions or disabled rules.

## Responsive behavior

- Desktop evidence covers the complete five-column activity table and composed overview/planning/details hierarchy.
- At 390×844, the first viewport retains financial context, activity rows lead with merchant and signed amount, and compact UTC date, category, and plain-language Income/Expense cues remain visible.
- Browser checks assert page width equals viewport width, important controls meet the 44px target, and goal editing remains usable without clipping or horizontal overflow.

## Browser console / network

- User-facing flows fail on page console errors, HTTP responses at or above 400, and failed network requests (with only explicit non-application browser noise exceptions).
- Loaded-state helpers wait for all independently fetched dashboard regions before full-page accessibility scans, preventing a passing audit of loading placeholders.

## Persistence and full-stack isolation

- Database and API integration tests start independent stateless local PostgreSQL instances and apply the checked-in PostgreSQL migration before exercising repositories and routes.
- Browser tests use separate database/API/web ports from the live preview, so validation does not intentionally overwrite the user's demo data or stop the visible application.
- Executable policy tests reject SQLite provider, migration, preview, E2E, or environment drift and require the exact-pinned Prisma PostgreSQL adapter/runtime path.
