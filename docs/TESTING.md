# Testing and validation contract

## One command

`npm run validate` is the only required repository gate. It must eventually run, in order:

1. harness/structure checks;
2. formatting and linting;
3. TypeScript type checks;
4. unit tests;
5. API integration tests;
6. production builds;
7. Playwright browser E2E tests;
8. architecture and documentation checks.

The same command runs in `.github/workflows/validate.yml` for every pull request and push to `main`. Hosted validation installs exactly from `package-lock.json`; it does not replace or fork the local gate.

During Harness v1, only the structure and state checks exist. Product tasks may add their appropriate stage, but must preserve this single entry point.

## Test levels

| Level       | Proves                          | Examples                                                 |
| ----------- | ------------------------------- | -------------------------------------------------------- |
| Unit        | deterministic domain behavior   | savings gap, rounding, category eligibility, goal pace   |
| Component   | visible UI behavior             | amount formatting, form validation, loading/error states |
| Integration | API + persistence boundary      | transaction filtering, goal updates, response contracts  |
| E2E         | user outcomes in a real browser | inspect spending, set goal, see accurate recommendations |

## Browser rules

Every user-facing task requires a browser validation pass before completion. Automated Playwright coverage is required for the primary flow and regression-prone behavior. The agent must inspect console errors and failed network requests; a visually rendered screen with an API failure is not a pass.

Visual/UX work additionally requires screenshot evidence at both desktop and mobile sizes, keyboard/focus checks, and review against `docs/EXPERIENCE.md`. A passing DOM assertion alone is not visual validation.

## Test integrity

- Test expected outcomes, boundary cases, invalid inputs, and the permanent rules in `DOMAIN_RULES.md`.
- Keep tests deterministic: freeze time, use isolated data, and avoid real bank/network dependencies.
- Tests are product evidence. Never delete, skip, weaken, or update an expectation merely to accommodate a broken implementation.
- A verifier subagent must independently check the task's acceptance coverage and validation output.
