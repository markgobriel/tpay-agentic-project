import { useEffect, useState } from "react";
import type { RecommendationsResponse } from "@save-and-spend/contracts";
import { fetchRecommendations } from "./api.js";
import { formatMinorAsCurrency } from "./formatMoney.js";
import { PanelMessage } from "./PanelMessage.js";

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
  const [reloadToken, setReloadToken] = useState(0);

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
        setPlan(null);
        setError(err instanceof Error ? err.message : "Failed to load recommendations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadToken]);

  return (
    <section className="panel" aria-labelledby="recommendations-heading">
      <p className="panel-kicker">Discretionary help</p>
      <h2 id="recommendations-heading" className="panel-title">
        Cut suggestions
      </h2>
      <p className="muted">
        Rule-based insights from mock spending — not professional financial advice. Essentials are
        never cut.
      </p>
      {loading ? (
        <PanelMessage tone="status" testId="recommendations-loading">
          Loading recommendations…
        </PanelMessage>
      ) : null}
      {error ? (
        <div className="feedback-banner">
          <PanelMessage tone="error" testId="recommendations-error">
            {error}
          </PanelMessage>
          <button
            type="button"
            className="retry-button"
            data-testid="recommendations-retry"
            onClick={() => setReloadToken((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      ) : null}

      {plan ? (
        <div data-testid="recommendations-panel">
          <dl className="metrics rec-metrics">
            <div>
              <dt>Savings gap</dt>
              <dd className="money" data-testid="rec-gap">
                {formatMinorAsCurrency(plan.savingsGapMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Proposed cuts</dt>
              <dd className="money" data-testid="rec-total-cuts">
                {formatMinorAsCurrency(plan.totalProposedReductionMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Unresolved gap</dt>
              <dd className="money" data-testid="rec-unresolved">
                {formatMinorAsCurrency(plan.unresolvedGapMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Projected monthly savings</dt>
              <dd className="money" data-testid="rec-projected-savings">
                {formatMinorAsCurrency(plan.projectedMonthlySavingsMinor, currencyCode)}
              </dd>
            </div>
          </dl>

          {plan.recommendations.length === 0 ? (
            <PanelMessage tone="empty" testId="rec-empty">
              No discretionary cuts needed for the current gap.
            </PanelMessage>
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

      {!loading && !plan && !error ? (
        <PanelMessage tone="empty" testId="recommendations-empty">
          Recommendations are unavailable for this view.
        </PanelMessage>
      ) : null}
    </section>
  );
}
