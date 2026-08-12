import { useCallback, useEffect, useState } from "react";
import type {
  AccountResponse,
  MonthlyAnalyticsResponse,
  TransactionResponse,
} from "@save-and-spend/contracts";
import { fetchAccount, fetchMonthlyAnalytics, fetchTransactions } from "./api.js";
import { CategoryBreakdown } from "./CategoryBreakdown.js";
import { DemoGuide } from "./DemoGuide.js";
import { filterTransactionsByYearMonth } from "./filterTransactionsByMonth.js";
import { formatMinorAsCurrency } from "./formatMoney.js";
import { formatTransactionAmount } from "./formatTransactionAmount.js";
import { formatTransactionDate } from "./formatTransactionDate.js";
import { formatYearMonthLabel } from "./formatYearMonth.js";
import { PanelMessage } from "./PanelMessage.js";
import { RecommendationsPanel } from "./RecommendationsPanel.js";
import { SavingsGoalPanel } from "./SavingsGoalPanel.js";

const DEFAULT_MONTH = "2026-07";

export function App() {
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [paceMonth, setPaceMonth] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [analytics, setAnalytics] = useState<MonthlyAnalyticsResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [recommendationsRefreshKey, setRecommendationsRefreshKey] = useState(0);

  const retryDashboard = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const handlePaceMonthChange = useCallback((yearMonth: string) => {
    setPaceMonth(yearMonth);
  }, []);

  const showPaceMonth = useCallback(() => {
    if (paceMonth) {
      setMonth(paceMonth);
    }
  }, [paceMonth]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const [accountResponse, analyticsResponse, transactionsResponse] = await Promise.all([
          fetchAccount(),
          fetchMonthlyAnalytics(month),
          fetchTransactions(),
        ]);
        if (cancelled) return;
        setAccount(accountResponse);
        setAnalytics(analyticsResponse);
        setTransactions(transactionsResponse.transactions);
      } catch (err) {
        if (cancelled) return;
        setAccount(null);
        setAnalytics(null);
        setTransactions([]);
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [month, reloadToken]);

  const monthMismatch = paceMonth !== null && paceMonth !== month;
  const monthTransactions = filterTransactionsByYearMonth(transactions, month);

  return (
    <main className="shell" data-testid="app-shell">
      <header className="app-header">
        <div className="wordmark" aria-label="Save and Spend">
          <span className="wordmark-mark" aria-hidden="true">
            S
          </span>
          <div>
            <p className="brand">Save &amp; Spend</p>
            <p className="product-label">Personal finance workspace</p>
          </div>
        </div>
        <p className="demo-status">
          <span aria-hidden="true" /> Demo account
        </p>
      </header>

      <section className="page-intro" aria-labelledby="page-title">
        <p className="panel-kicker">Financial overview</p>
        <h1 id="page-title">Your money, clearly.</h1>
        <p className="lede">See what came in, what went out, and what to do next.</p>
      </section>

      <DemoGuide />

      {loading ? (
        <PanelMessage tone="status" testId="dashboard-loading">
          Loading account and monthly summary…
        </PanelMessage>
      ) : null}
      {error ? (
        <div className="feedback-banner" data-testid="dashboard-error">
          <PanelMessage tone="error">{error}</PanelMessage>
          <button type="button" className="secondary-button" onClick={retryDashboard}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="overview-surface" aria-label="Account and monthly overview">
        {account ? (
          <section
            className="balance-block"
            aria-labelledby="balance-heading"
            data-testid="balance-panel"
          >
            <p className="section-label">Available balance</p>
            <h2 id="balance-heading" className="account-name">
              {account.name}
            </h2>
            <p className="balance money" data-testid="current-balance">
              {formatMinorAsCurrency(account.currentBalanceMinor, account.currencyCode)}
            </p>
            <p className="balance-note">Seeded checking account</p>
          </section>
        ) : (
          <section className="balance-block" data-testid="balance-placeholder" aria-busy={loading}>
            <p className="section-label">Available balance</p>
            <h2 className="account-name">Account</h2>
            <PanelMessage tone={loading ? "status" : "empty"} testId="balance-empty">
              {loading ? "Loading balance…" : "Balance unavailable until the account loads."}
            </PanelMessage>
          </section>
        )}

        <section className="month-block" aria-labelledby="month-heading" data-testid="month-panel">
          <div className="month-block-head">
            <div>
              <p className="section-label">Monthly movement</p>
              <h2 id="month-heading" className="panel-title">
                {formatYearMonthLabel(month)}
              </h2>
            </div>
            <label className="month-label">
              <span>Change month</span>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Selected UTC month"
              />
            </label>
          </div>
          {analytics ? (
            <dl className="metrics overview-metrics">
              <div>
                <dt>Income</dt>
                <dd className="money" data-testid="monthly-income">
                  {formatMinorAsCurrency(analytics.incomeMinor, account?.currencyCode)}
                </dd>
              </div>
              <div>
                <dt>Spending</dt>
                <dd className="money" data-testid="monthly-spending">
                  {formatMinorAsCurrency(analytics.spendingMinor, account?.currencyCode)}
                </dd>
              </div>
              <div>
                <dt>Net savings</dt>
                <dd className="money" data-testid="monthly-savings">
                  {formatMinorAsCurrency(
                    analytics.currentMonthlySavingsMinor,
                    account?.currencyCode,
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <PanelMessage tone={loading ? "status" : "empty"} testId="month-empty">
              {loading ? "Loading monthly position…" : "No monthly summary for this selection yet."}
            </PanelMessage>
          )}
        </section>
      </section>

      {monthMismatch && paceMonth ? (
        <div className="mismatch-banner" data-testid="month-mismatch" role="status">
          <p>
            Goal pace and cut suggestions use <strong>{formatYearMonthLabel(paceMonth)}</strong>{" "}
            spending. Monthly position above currently shows{" "}
            <strong>{formatYearMonthLabel(month)}</strong>.
          </p>
          <button
            type="button"
            className="secondary-button"
            data-testid="show-pace-month"
            onClick={showPaceMonth}
          >
            Show {formatYearMonthLabel(paceMonth)} in monthly position
          </button>
        </div>
      ) : null}

      <section className="workspace-section" aria-labelledby="plan-heading">
        <header className="section-heading">
          <div>
            <p className="panel-kicker">Plan</p>
            <h2 id="plan-heading">Turn this month into progress.</h2>
          </div>
          <p>Set the destination, then use explainable suggestions to close the gap.</p>
        </header>

        <div className="planning-grid">
          <SavingsGoalPanel
            currencyCode={account?.currencyCode ?? "USD"}
            onGoalSaved={() => setRecommendationsRefreshKey((value) => value + 1)}
            onPaceMonthChange={handlePaceMonthChange}
          />

          <RecommendationsPanel
            currencyCode={account?.currencyCode ?? "USD"}
            refreshKey={recommendationsRefreshKey}
          />
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="activity-heading">
        <header className="section-heading compact-heading">
          <div>
            <p className="panel-kicker">Details</p>
            <h2 id="activity-heading">Understand where it went.</h2>
          </div>
          <p>Category composition and every transaction for the selected month.</p>
        </header>

        <div className="activity-grid">
          <section
            className="activity-card category-card"
            aria-labelledby="categories-heading"
            data-testid="categories-panel"
          >
            <p className="panel-kicker">Breakdown</p>
            <h2 id="categories-heading" className="panel-title">
              Spending by category
            </h2>
            {loading ? (
              <PanelMessage tone="status" testId="categories-loading">
                Loading category spending…
              </PanelMessage>
            ) : null}
            {!loading && analytics && analytics.categorySpending.length > 0 ? (
              <CategoryBreakdown
                categories={analytics.categorySpending}
                currencyCode={account?.currencyCode ?? "USD"}
              />
            ) : null}
            {!loading && (!analytics || analytics.categorySpending.length === 0) ? (
              <PanelMessage tone="empty" testId="categories-empty">
                No category spending for this month.
              </PanelMessage>
            ) : null}
          </section>

          <section
            className="activity-card transaction-card"
            aria-labelledby="transactions-heading"
            data-testid="transactions-panel"
          >
            <p className="panel-kicker">Activity</p>
            <h2 id="transactions-heading" className="panel-title">
              Transaction history
            </h2>
            <p className="calc-month" data-testid="transactions-month-label">
              Showing {formatYearMonthLabel(month)} activity for this account.
            </p>
            {loading ? (
              <PanelMessage tone="status" testId="transactions-loading">
                Loading transactions…
              </PanelMessage>
            ) : null}
            {!loading && monthTransactions.length === 0 ? (
              <PanelMessage tone="empty" testId="transactions-empty">
                {`No transactions in ${formatYearMonthLabel(month)}.`}
              </PanelMessage>
            ) : null}
            {!loading && monthTransactions.length > 0 ? (
              <div className="table-wrap">
                <table className="transactions">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Merchant</th>
                      <th scope="col">Category</th>
                      <th scope="col">Type</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthTransactions.map((txn) => (
                      <tr key={txn.id}>
                        <td className="txn-date">
                          <time dateTime={txn.occurredAt}>
                            {formatTransactionDate(txn.occurredAt)}
                          </time>
                        </td>
                        <td className="txn-merchant">{txn.merchant}</td>
                        <td className="txn-category">
                          <span className="txn-category-separator" aria-hidden="true">
                            •
                          </span>
                          <span className="txn-category-label">
                            {txn.category.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className={`txn-type txn-type--${txn.type}`}>
                          {txn.type === "income" ? "Income" : "Expense"}
                        </td>
                        <td className={`money txn-amount txn-amount--${txn.type}`}>
                          {formatTransactionAmount(
                            txn.amountMinor,
                            txn.type,
                            account?.currencyCode,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
