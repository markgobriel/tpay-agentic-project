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
  const [expanded, setExpanded] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <aside className="demo-guide" data-testid="demo-guide" aria-labelledby="demo-guide-heading">
      <div className="demo-guide-summary">
        <div className="demo-guide-copy">
          <p className="panel-kicker">Guided demo</p>
          <h2 id="demo-guide-heading" className="panel-title">
            Mock data, real workflow
          </h2>
          <p className="demo-guide-intro">
            Explore a seeded account, adjust the savings goal, and see explainable cut suggestions.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button demo-guide-toggle"
          data-testid="demo-guide-toggle"
          aria-expanded={expanded}
          aria-controls="demo-guide-details"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "How it works"}
        </button>
      </div>
      {expanded ? (
        <div id="demo-guide-details" className="demo-guide-details">
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
            Dismiss guide
          </button>
        </div>
      ) : null}
    </aside>
  );
}
