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
            Edit the savings goal to see required monthly savings and on-pace status update from the
            same rules.
          </li>
          <li>
            Check discretionary cut suggestions only when a savings gap exists—essentials are never
            recommended for cuts. This is explainable mock math, not personal financial advice.
          </li>
        </ol>
      </div>
      <button
        type="button"
        className="demo-guide-dismiss"
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
