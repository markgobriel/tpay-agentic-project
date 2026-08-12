import { useEffect, useState } from "react";
import type { RecommendationsResponse } from "@save-and-spend/contracts";
import { fetchRecommendations } from "./api.js";
import { formatMinorAsCurrency } from "./formatMoney.js";

export interface RecommendationsPanelProps {
  currencyCode?: string;
  /** Bump to reload after goal changes. */
  refreshKey?: number;
}

export function RecommendationsPanel({
  currencyCode = "USD",
  refreshKey = 0,
}: RecommendationsPanelProps) {
  const [plan, setPlan] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const response = await fetchRecommendations();
        if (cancelled) return;
        setPlan(response);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load recommendations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className="panel" aria-labelledby="recommendations-heading">
      <h2 id="recommendations-heading" className="panel-title">
        Discretionary cut suggestions
      </h2>
      <p className="muted">
        Rule-based insights from mock spending — not professional financial advice. Essentials are
        never cut.
      </p>
      {loading ? <p role="status">Loading recommendations…</p> : null}
      {error ? (
        <p role="alert" className="error" data-testid="recommendations-error">
          {error}
        </p>
      ) : null}

      {plan ? (
        <div data-testid="recommendations-panel">
          <dl className="metrics">
            <div>
              <dt>Savings gap</dt>
              <dd data-testid="rec-gap">
                {formatMinorAsCurrency(plan.savingsGapMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Proposed cuts</dt>
              <dd data-testid="rec-total-cuts">
                {formatMinorAsCurrency(plan.totalProposedReductionMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Unresolved gap</dt>
              <dd data-testid="rec-unresolved">
                {formatMinorAsCurrency(plan.unresolvedGapMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Projected monthly savings</dt>
              <dd data-testid="rec-projected-savings">
                {formatMinorAsCurrency(plan.projectedMonthlySavingsMinor, currencyCode)}
              </dd>
            </div>
          </dl>

          {plan.recommendations.length === 0 ? (
            <p className="muted" data-testid="rec-empty">
              No discretionary cuts needed for the current gap.
            </p>
          ) : (
            <ol className="recommendation-list" data-testid="rec-list">
              {plan.recommendations.map((line) => (
                <li key={line.category}>
                  <div className="rec-line-head">
                    <strong>
                      #{line.priority} {line.category}
                    </strong>
                    <span data-testid={`rec-cut-${line.category}`}>
                      Cut {formatMinorAsCurrency(line.proposedReductionMinor, currencyCode)}
                    </span>
                  </div>
                  <p className="muted">
                    {formatMinorAsCurrency(line.currentSpendingMinor, currencyCode)} →{" "}
                    {formatMinorAsCurrency(line.spendingAfterReductionMinor, currencyCode)}.{" "}
                    {line.explanation}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </section>
  );
}
