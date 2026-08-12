import { useEffect, useState } from "react";
import type {
  AccountResponse,
  MonthlyAnalyticsResponse,
  TransactionResponse,
} from "@save-and-spend/contracts";
import { fetchAccount, fetchMonthlyAnalytics, fetchTransactions } from "./api.js";
import { CategoryBreakdown } from "./CategoryBreakdown.js";
import { DemoGuide } from "./DemoGuide.js";
import { formatMinorAsCurrency } from "./formatMoney.js";
import { RecommendationsPanel } from "./RecommendationsPanel.js";
import { SavingsGoalPanel } from "./SavingsGoalPanel.js";

const DEFAULT_MONTH = "2026-07";

export function App() {
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [analytics, setAnalytics] = useState<MonthlyAnalyticsResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsRefreshKey, setRecommendationsRefreshKey] = useState(0);

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
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <main className="shell" data-testid="app-shell">
      <header className="hero">
        <p className="brand">Save &amp; Spend</p>
        <p className="lede">Balance, monthly position, and a calm plan for your goal.</p>
      </header>

      <DemoGuide />

      {loading ? <p role="status">Loading account…</p> : null}
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}

      <section className="overview" aria-label="Financial overview">
        {account ? (
          <section className="panel" aria-labelledby="balance-heading" data-testid="balance-panel">
            <p className="panel-kicker">Account</p>
            <h1 id="balance-heading" className="panel-title">
              {account.name}
            </h1>
            <p className="balance money" data-testid="current-balance">
              {formatMinorAsCurrency(account.currentBalanceMinor, account.currencyCode)}
            </p>
            <p className="muted">Current balance</p>
          </section>
        ) : (
          <section className="panel" aria-hidden="true" />
        )}

        <section className="panel" aria-labelledby="month-heading" data-testid="month-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">This month</p>
              <h2 id="month-heading" className="panel-title">
                Monthly position
              </h2>
            </div>
            <label className="month-label">
              Month
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Selected UTC month"
              />
            </label>
          </div>
          {analytics ? (
            <dl className="metrics">
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
          ) : null}
        </section>
      </section>

      <SavingsGoalPanel
        currencyCode={account?.currencyCode ?? "USD"}
        onGoalSaved={() => setRecommendationsRefreshKey((value) => value + 1)}
      />

      <RecommendationsPanel
        currencyCode={account?.currencyCode ?? "USD"}
        refreshKey={recommendationsRefreshKey}
      />

      <div className="secondary-stack">
        {analytics && analytics.categorySpending.length > 0 ? (
          <section className="panel" aria-labelledby="categories-heading">
            <p className="panel-kicker">Breakdown</p>
            <h2 id="categories-heading" className="panel-title">
              Spending by category
            </h2>
            <CategoryBreakdown
              categories={analytics.categorySpending}
              currencyCode={account?.currencyCode ?? "USD"}
            />
          </section>
        ) : null}

        <section className="panel" aria-labelledby="transactions-heading">
          <p className="panel-kicker">Activity</p>
          <h2 id="transactions-heading" className="panel-title">
            Transaction history
          </h2>
          {transactions.length === 0 && !loading ? (
            <p className="muted">No transactions yet.</p>
          ) : (
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
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>{txn.occurredAt.slice(0, 10)}</td>
                      <td>{txn.merchant}</td>
                      <td>{txn.category.replaceAll("_", " ")}</td>
                      <td>{txn.type}</td>
                      <td className="money">
                        {formatMinorAsCurrency(txn.amountMinor, account?.currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
