import type { CategorySpendingResponse } from "@save-and-spend/contracts";
import { formatMinorAsCurrency } from "./formatMoney.js";
import { categorySharePercent } from "./categoryShare.js";

export interface CategoryBreakdownProps {
  categories: CategorySpendingResponse[];
  currencyCode?: string;
}

export function CategoryBreakdown({ categories, currencyCode = "USD" }: CategoryBreakdownProps) {
  const totalMinor = categories.reduce((sum, row) => sum + row.amountMinor, 0);
  const sorted = [...categories].sort((a, b) => b.amountMinor - a.amountMinor);

  if (sorted.length === 0) {
    return <p className="muted">No category spending for this month.</p>;
  }

  return (
    <ul className="category-bars" data-testid="category-breakdown">
      {sorted.map((row) => {
        const share = categorySharePercent(row.amountMinor, totalMinor);
        const label = row.category.replaceAll("_", " ");
        return (
          <li key={row.category} className="category-bar-item">
            <div className="category-bar-meta">
              <span className="category-bar-name">{label}</span>
              <span className="money category-bar-amount" data-testid="category-bar-amount">
                {formatMinorAsCurrency(row.amountMinor, currencyCode)}
                <span className="category-bar-share"> · {share}%</span>
              </span>
            </div>
            <div
              className="category-bar-track"
              role="meter"
              aria-label={`${label} share of monthly spending`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={share}
              aria-valuetext={`${share} percent`}
            >
              <div className="category-bar-fill" style={{ width: `${share}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
