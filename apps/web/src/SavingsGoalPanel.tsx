import { useEffect, useState, type FormEvent } from "react";
import type { SavingsGoalResponse } from "@save-and-spend/contracts";
import { fetchSavingsGoal, upsertSavingsGoal } from "./api.js";
import { formatMinorAsCurrency } from "./formatMoney.js";
import { formatYearMonthLabel } from "./formatYearMonth.js";
import { minorToMajorInput, parseMajorCurrencyToMinor } from "./moneyInput.js";
import { PanelMessage } from "./PanelMessage.js";

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function toTargetDateIso(dateInput: string): string {
  return `${dateInput}T00:00:00.000Z`;
}

export interface SavingsGoalPanelProps {
  currencyCode?: string;
  onGoalSaved?: () => void;
  /** Notifies the dashboard which UTC month the pace math uses. */
  onPaceMonthChange?: (yearMonth: string) => void;
}

export function SavingsGoalPanel({
  currencyCode = "USD",
  onGoalSaved,
  onPaceMonthChange,
}: SavingsGoalPanelProps) {
  const [goal, setGoal] = useState<SavingsGoalResponse | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentSaved, setCurrentSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const response = await fetchSavingsGoal();
        if (cancelled) return;
        setGoal(response);
        setName(response.name);
        setTargetAmount(minorToMajorInput(response.targetAmountMinor));
        setCurrentSaved(minorToMajorInput(response.currentSavedMinor));
        setTargetDate(toDateInputValue(response.targetDate));
        onPaceMonthChange?.(response.analyticsYearMonth);
      } catch (err) {
        if (cancelled) return;
        setGoal(null);
        setError(err instanceof Error ? err.message : "Failed to load savings goal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken, onPaceMonthChange]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatusMessage(null);
    setError(null);

    let targetAmountMinor: number;
    let currentSavedMinor: number;
    try {
      targetAmountMinor = parseMajorCurrencyToMinor(targetAmount);
      currentSavedMinor = parseMajorCurrencyToMinor(currentSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid amount.");
      return;
    }

    if (name.trim().length === 0) {
      setError("Goal name is required.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      setError("Choose a valid target date.");
      return;
    }

    setSaving(true);
    setStatusMessage("Saving goal…");
    try {
      const updated = await upsertSavingsGoal({
        name: name.trim(),
        targetAmountMinor,
        currentSavedMinor,
        targetDate: toTargetDateIso(targetDate),
      });
      setGoal(updated);
      setName(updated.name);
      setTargetAmount(minorToMajorInput(updated.targetAmountMinor));
      setCurrentSaved(minorToMajorInput(updated.currentSavedMinor));
      setTargetDate(toDateInputValue(updated.targetDate));
      setStatusMessage("Savings goal saved.");
      onPaceMonthChange?.(updated.analyticsYearMonth);
      onGoalSaved?.();
    } catch (err) {
      setStatusMessage(null);
      setError(err instanceof Error ? err.message : "Failed to save savings goal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="goal-heading" data-testid="goal-panel">
      <p className="panel-kicker">Goal health</p>
      <h2 id="goal-heading" className="panel-title">
        Savings goal
      </h2>
      {loading ? (
        <PanelMessage tone="status" testId="goal-loading">
          Loading savings goal…
        </PanelMessage>
      ) : null}
      {error ? (
        <div className="feedback-banner">
          <PanelMessage tone="error" testId="goal-error">
            {error}
          </PanelMessage>
          {!saving ? (
            <button
              type="button"
              className="secondary-button"
              data-testid="goal-retry"
              onClick={() => setReloadToken((value) => value + 1)}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      {statusMessage ? (
        <PanelMessage tone={saving ? "status" : "success"} testId="goal-status">
          {statusMessage}
        </PanelMessage>
      ) : null}

      {!loading && !goal && !error ? (
        <PanelMessage tone="empty" testId="goal-empty">
          No savings goal loaded yet.
        </PanelMessage>
      ) : null}

      {goal ? (
        <>
          <p className="calc-month" data-testid="goal-calc-month">
            Pace uses {formatYearMonthLabel(goal.analyticsYearMonth)} spending (this month&apos;s
            savings versus what the goal needs each month).
          </p>
          <dl className="metrics goal-metrics" data-testid="goal-pace">
            <div>
              <dt>Current saved</dt>
              <dd className="money" data-testid="goal-current-saved">
                {formatMinorAsCurrency(goal.currentSavedMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Required monthly</dt>
              <dd className="money" data-testid="goal-required-monthly">
                {formatMinorAsCurrency(goal.requiredMonthlySavingsMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Savings gap</dt>
              <dd className="money" data-testid="goal-gap">
                {formatMinorAsCurrency(goal.savingsGapMinor, currencyCode)}
              </dd>
            </div>
            <div>
              <dt>Pace</dt>
              <dd>
                <span
                  className={`pace-pill ${goal.onPace ? "on-pace" : "behind-pace"}`}
                  data-testid="goal-on-pace"
                >
                  {goal.onPace ? "On pace" : "Behind pace"}
                </span>
              </dd>
            </div>
          </dl>
        </>
      ) : null}

      <form className="goal-form" onSubmit={(event) => void onSubmit(event)} noValidate>
        <label>
          Goal name
          <input
            data-testid="goal-name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
            required
          />
        </label>
        <label>
          Target amount (USD)
          <input
            data-testid="goal-target-input"
            inputMode="decimal"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            aria-describedby="goal-amount-help"
            required
          />
        </label>
        <label>
          Current saved (USD)
          <input
            data-testid="goal-saved-input"
            inputMode="decimal"
            value={currentSaved}
            onChange={(event) => setCurrentSaved(event.target.value)}
            aria-describedby="goal-amount-help"
            required
          />
        </label>
        <p id="goal-amount-help" className="field-help" data-testid="goal-amount-help">
          Enter dollars and cents, like 1200.00. Do not include a $ sign.
        </p>
        <label>
          Target date
          <input
            data-testid="goal-date-input"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            required
          />
        </label>
        <button
          data-testid="goal-save-button"
          className="primary-button"
          type="submit"
          disabled={saving || loading}
        >
          {saving ? "Saving…" : "Save goal"}
        </button>
      </form>
    </section>
  );
}
