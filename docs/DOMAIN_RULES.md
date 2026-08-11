# Financial domain rules

These rules are permanent MVP invariants. Tests must encode them.

## Money and dates

- Monetary amounts are non-negative integer minor units at persistence and domain boundaries. Formatting happens only at presentation boundaries.
- Income and expense are represented explicitly; do not infer type from a signed floating-point number.
- Monthly analysis uses the transaction's occurred date and an explicit **UTC** calendar-month timezone policy (`ANALYSIS_TIMEZONE` in `packages/domain`).
- A target date must be after the calculation date. A goal target amount and current saved amount cannot be negative.

## Monthly calculations

For a selected calendar month:

```text
income = sum(income transactions)
spending = sum(expense transactions)
current monthly savings = income - spending
category spending = sum(expense transactions in category)
```

For an active goal:

```text
remaining goal = max(target amount - current saved amount, 0)
months remaining = whole monthly periods remaining according to the documented date policy
required monthly savings = ceil(remaining goal / months remaining)
savings gap = max(required monthly savings - current monthly savings, 0)
```

If `remaining goal` is zero, required savings and gap are zero, and the goal is complete. If the target date is invalid or no monthly period remains, the API returns a validation/domain error rather than dividing by zero.

## Categories

Essential categories are **rent, utilities, groceries, transportation, healthcare, and debt minimum payments**. They are never eligible for savings-cut recommendations.

Eligible discretionary categories are **restaurants, shopping, entertainment, subscriptions, and other**. The initial deterministic recommendation priority is:

1. subscriptions
2. restaurants
3. entertainment
4. shopping
5. other

## Recommendations

- Recommendations are calculated only from spending in eligible discretionary categories.
- The reduction total cannot exceed actual spending available in each category or in aggregate.
- Recommendations are ordered by the documented priority and explain the proposed reduction and resulting monthly savings.
- If the gap is larger than eligible spending, clearly report the unresolved amount; never fabricate a plan or cut essentials.
- Recommendations are budget insights derived from mock data, not professional financial advice.
