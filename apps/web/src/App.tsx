import { useEffect, useState } from "react";
import type {
  AccountResponse,
  MonthlyAnalyticsResponse,
  TransactionResponse,
} from "@save-and-spend/contracts";
import { fetchAccount, fetchMonthlyAnalytics, fetchTransactions } from "./api.js";
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
    <main className="shell">
      <header className="hero">
        <p className="brand">Save &amp; Spend</p>
        <p className="lede">One account. Clear monthly spending. A plan you can follow.</p>
      </header>

      {loading ? <p role="status">Loading account…</p> : null}
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}

      {account ? (
        <section className="panel" aria-labelledby="balance-heading">
          <h1 id="balance-heading" className="panel-title">
            {account.name}
          </h1>
          <p className="balance" data-testid="current-balance">
            {formatMinorAsCurrency(account.currentBalanceMinor, account.currencyCode)}
          </p>
          <p className="muted">Current balance</p>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="month-heading">
        <div className="panel-head">
          <h2 id="month-heading" className="panel-title">
            Monthly summary
          </h2>
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
              <dd data-testid="monthly-income">
                {formatMinorAsCurrency(analytics.incomeMinor, account?.currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Spending</dt>
              <dd data-testid="monthly-spending">
                {formatMinorAsCurrency(analytics.spendingMinor, account?.currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Net savings</dt>
              <dd data-testid="monthly-savings">
                {formatMinorAsCurrency(analytics.currentMonthlySavingsMinor, account?.currencyCode)}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <SavingsGoalPanel
        currencyCode={account?.currencyCode ?? "USD"}
        onGoalSaved={() => setRecommendationsRefreshKey((value) => value + 1)}
      />

      <RecommendationsPanel
        currencyCode={account?.currencyCode ?? "USD"}
        refreshKey={recommendationsRefreshKey}
      />

      {analytics && analytics.categorySpending.length > 0 ? (
        <section className="panel" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="panel-title">
            Spending by category
          </h2>
          <ul className="category-list">
            {analytics.categorySpending.map((row) => (
              <li key={row.category}>
                <span>{row.category.replaceAll("_", " ")}</span>
                <span>{formatMinorAsCurrency(row.amountMinor, account?.currencyCode)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="transactions-heading">
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
                    <td>{formatMinorAsCurrency(txn.amountMinor, account?.currencyCode)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
