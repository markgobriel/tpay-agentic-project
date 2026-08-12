# Design reference audit

## Purpose

This audit translates current finance-dashboard and platform guidance into an original Save & Spend layout. References inform hierarchy, density, and interaction patterns only. No source artwork, proprietary asset, screen, or component is copied.

## Sources reviewed

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines): prioritize content through clear hierarchy, consistency, and restrained controls.
- [Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography): use a small, legible type system with weight, size, and color carrying the hierarchy.
- [Minimal finance dashboard on Dribbble](https://dribbble.com/shots/26566238-Finance-Dashboard-Design): a quiet palette, compact cash-flow summary, expense breakdown, and transaction activity organized into distinct regions.
- [Personal finance app on Dribbble](https://dribbble.com/shots/18868568-Personal-Finance-App): prominent monthly summary followed by supporting analysis, using spacing and alignment more than decoration.
- [Personal Financial Management System on Behance](https://www.behance.net/gallery/180717571/Personal-Financial-Management-System-UI-Dashboard): overview metrics, spending composition, goals, and recent activity receive different visual roles within one workspace.

## Applied principles

1. **One glance, one story.** Lead with balance and monthly movement in one composed overview instead of two equally weighted cards.
2. **Planning is a workspace.** Place goal health and cut guidance together so the relationship between the gap and recommendations is visible.
3. **Details come after decisions.** Category composition and transaction activity sit below the plan and use denser, quieter presentation.
4. **Hierarchy before decoration.** Use scale, weight, alignment, and spacing; avoid gradients, glass, ornamental shadows, and repeated rounded containers.
5. **One accent, semantic states.** Deep green identifies actions and progress. Red is reserved for genuine behind-pace/error meaning.
6. **Controls look operable.** Inputs and buttons have clear boundaries, labels, focus states, and touch targets; static labels never imitate controls.
7. **Responsive, not compressed.** Desktop uses intentional columns. Mobile returns to one reading order, keeps balance in the first viewport, and presents transactions as merchant-first rows.

## Deliberate exclusions

- No sidebar: this MVP has one destination, so persistent navigation would add chrome without utility.
- No fake charts or trend percentages: the API does not provide time-series comparisons, and presentation must not invent financial meaning.
- No quick-transfer or banking actions: the approved scope is read-only mock account insight plus one editable savings goal.
