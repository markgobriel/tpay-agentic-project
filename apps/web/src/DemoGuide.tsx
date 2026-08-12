import { useState } from "react";

const STORAGE_KEY = "save-spend-demo-guide-dismissed";

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function DemoGuide() {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed) {
    return null;
  }

  return (
    <aside className="demo-guide" data-testid="demo-guide" aria-labelledby="demo-guide-heading">
      <div className="demo-guide-copy">
        <p className="panel-kicker">Demo walkthrough</p>
        <h2 id="demo-guide-heading" className="panel-title">
          How to read this mock account
        </h2>
        <ol className="demo-guide-steps">
          <li>
            Review the seeded balance and the selected month&apos;s income, spending, and category
            bars.
          </li>
          <li>
            Edit the savings goal to see required monthly savings and on-pace status. Pace uses a
            specific calculation month—check the label under Savings goal if it differs from the
            month picker.
          </li>
          <li>
            Cut suggestions only appear when that calculation month has discretionary spending to
            reduce. A savings gap with $0 cuts means essentials-only or empty-month spending, not
            that the gap is gone. This is explainable mock math, not personal financial advice.
          </li>
        </ol>
      </div>
      <button
        type="button"
        className="secondary-button demo-guide-dismiss"
        data-testid="demo-guide-dismiss"
        onClick={() => {
          try {
            window.localStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* ignore quota / private mode */
          }
          setDismissed(true);
        }}
      >
        Got it
      </button>
    </aside>
  );
}
