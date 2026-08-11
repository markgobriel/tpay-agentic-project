# Product contract

## Purpose

Save & Spend is a web-based, mock personal-finance application for one bank account. It turns transaction history into a clear monthly spending view and a deterministic plan for reaching a savings goal.

## MVP capabilities

1. Show the account's current balance.
2. Show transaction history with date, merchant, amount, type, and category.
3. Show monthly income, spending, net monthly savings, and spending by category.
4. Let the user create and update one savings goal: name, target amount, current saved amount, and target date.
5. Calculate the monthly amount required to meet the goal and whether the user is on pace.
6. Produce specific, deterministic suggestions for reducing discretionary spending to close a monthly savings gap.

## Scope boundaries

- One mock account; no sign-up, login, multi-user support, or real banking connection.
- Generated/seeded mock transactions only.
- One active savings goal at a time for the MVP.
- The recommendation engine is rule based and explains its math; it is not an LLM or financial adviser.
- This is a responsive web app, not a native mobile app.

## Core user flow

1. User opens the dashboard and sees balance and the selected month's summary.
2. User reviews categorized transactions and current monthly savings.
3. User enters a savings target and target date.
4. User sees required monthly savings, projected goal status, and any gap.
5. If a gap exists, the user sees reductions limited to discretionary categories and totaling enough to close the feasible portion of that gap.

## Definition of done

The MVP is complete only when every task in `backlog/tasks.json` is done, every acceptance criterion is covered by automated evidence, `npm run validate` passes, and the browser E2E flow demonstrates the core user flow without console or network errors.
