# Experience and visual design contract

## Direction

Save & Spend should feel calm, focused, tactile, and native to the Apple ecosystem: the clarity of iOS and macOS system surfaces, generous spacing, confident typography, restrained color, familiar controls, and feedback that never competes with the financial information.

This is **Apple-inspired**, not a copy of Apple product screens or proprietary assets. Use platform-native system fonts and original interface composition; do not use Apple logos, artwork, product marks, or copied UI assets.

## Visual system

- Prefer the system UI stack: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Display`, `SF Pro Text`, `Segoe UI`, and sans-serif fallbacks.
- Use a quiet, cool neutral canvas with layered translucent/light surfaces, hairline separators, a single blue action color, and semantic green/red only where financial state requires it.
- Use larger, rounded cards; clear elevation or subtle borders; consistent spacing; and dense-but-breathable data grouping.
- Establish a compact type scale with strong balance/goal hierarchy, readable supporting labels, tabular numerals for monetary values, and accessible contrast.
- Make interactive controls feel deliberate: rounded inputs/buttons, visible keyboard focus, pressed/disabled states, minimum 44px touch targets where practical, and no hover-only affordances.
- Use motion only to clarify a change and respect `prefers-reduced-motion`.

## Information and interaction priorities

At a glance, a user should understand:

1. current balance and this month's financial position;
2. goal health, required monthly savings, and any savings gap;
3. where discretionary changes can help;
4. recent transaction activity.

Use progressive disclosure and visual grouping rather than one long undifferentiated column. A user should not need to scan a dense table to understand the monthly picture. Preserve all existing deterministic calculations and API-backed content.

## Required experience validation

For the visual/UX task and every later user-facing change, validate as a real user at both a desktop viewport (1440px or equivalent) and a narrow mobile viewport (390px or equivalent):

1. load the dashboard and confirm the primary hierarchy is visible without confusion;
2. set and update a savings goal, including an invalid input path;
3. inspect recommendations and transaction content;
4. test keyboard navigation, focus visibility, and labels;
5. check overflow, clipped controls, contrast, console errors, and failed network requests;
6. capture reproducible Playwright evidence and screenshots before declaring the work complete.

The read-only verifier must compare screenshots and behavior against this document, not merely check that the app renders.
