import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { findCiWorkflowViolations } from "./ci-workflow-policy.mjs";

const workflowPath = ".github/workflows/validate.yml";
const workflow = fs.readFileSync(workflowPath, "utf8");

describe("hosted validation workflow", () => {
  it("satisfies the complete hosted-validation policy", () => {
    expect(findCiWorkflowViolations(workflow)).toEqual([]);
  });

  it("rejects added write access or failure suppression", () => {
    const withWritePermission = workflow.replace(
      "  contents: read",
      "  contents: read\n  issues: write",
    );
    expect(findCiWorkflowViolations(withWritePermission)).toContain(
      "write permission is forbidden",
    );

    const withContinueOnError = workflow.replace(
      "      - name: Validate repository",
      "      - name: Validate repository\n        continue-on-error: true",
    );
    expect(findCiWorkflowViolations(withContinueOnError)).toContain(
      "continue-on-error is forbidden",
    );

    const withJobPermissions = workflow.replace(
      "    timeout-minutes: 30",
      "    timeout-minutes: 30\n    permissions:\n      contents: read",
    );
    expect(findCiWorkflowViolations(withJobPermissions)).toContain(
      "workflow must have exactly one top-level permissions block",
    );
  });

  it("rejects a suppressed or altered repository gate", () => {
    const suppressed = workflow.replace("run: npm run validate", "run: npm run validate || true");
    expect(findCiWorkflowViolations(suppressed)).toContain(
      "validation command must not be modified or suppressed",
    );

    const suppressedInstall = workflow.replace("run: npm ci", "run: npm ci || true");
    expect(findCiWorkflowViolations(suppressedInstall)).toContain("missing exact command: npm ci");

    const duplicated = workflow.replace(
      "run: npm run validate",
      "run: npm run validate\n\n      - name: Validate again\n        run: npm run validate",
    );
    expect(findCiWorkflowViolations(duplicated)).toContain(
      "workflow must run the exact validation command once",
    );
  });

  it("rejects mutable actions and protected trigger drift", () => {
    const mutableAction = workflow.replace(
      "actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd",
      "actions/checkout@v6",
    );
    expect(findCiWorkflowViolations(mutableAction)).toContain(
      "official actions must match immutable approved commits",
    );

    const missingPullRequest = workflow.replace("  pull_request:\n", "");
    expect(findCiWorkflowViolations(missingPullRequest)).toContain("missing pull request trigger");

    const filteredPullRequest = workflow.replace(
      "  pull_request:\n",
      "  pull_request:\n    paths-ignore: ['docs/**']\n",
    );
    expect(findCiWorkflowViolations(filteredPullRequest)).toContain(
      "path filters must not skip validation",
    );

    const explicitToken = workflow.replace(
      "      - name: Check out repository",
      "      - env:\n          GITHUB_TOKEN: test\n\n      - name: Check out repository",
    );
    expect(findCiWorkflowViolations(explicitToken)).toContain(
      "secret or remote mutation behavior is forbidden",
    );
  });
});
