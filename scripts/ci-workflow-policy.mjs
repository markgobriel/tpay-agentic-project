const expectedActions = [
  "actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd",
  "actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e",
];

export function findCiWorkflowViolations(workflow) {
  const violations = [];

  if (!/on:\s*\n\s+push:\s*\n\s+branches: \[main\]/.test(workflow)) {
    violations.push("missing main push trigger");
  }
  if (!/\n\s+pull_request:\s*\n/.test(workflow)) violations.push("missing pull request trigger");
  if (!/\n\s+workflow_dispatch:\s*\n/.test(workflow)) {
    violations.push("missing manual trigger");
  }

  const topLevelPermissions = workflow.match(/^permissions:\s*\n((?: {2}[^\n]+\n)+)/m)?.[1].trim();
  if (topLevelPermissions !== "contents: read") {
    violations.push("permissions must be exactly contents read");
  }
  if ([...workflow.matchAll(/^\s*permissions:/gm)].length !== 1) {
    violations.push("workflow must have exactly one top-level permissions block");
  }
  if (
    /^\s*[a-z-]+:\s*write\s*$/im.test(workflow) ||
    /^\s*permissions:\s*write-all\s*$/im.test(workflow)
  ) {
    violations.push("write permission is forbidden");
  }
  if (/^\s*continue-on-error:/m.test(workflow)) {
    violations.push("continue-on-error is forbidden");
  }
  if (/secrets\.|github\.token|GITHUB_TOKEN|\bdeploy\b|\bpublish\b|git push/i.test(workflow)) {
    violations.push("secret or remote mutation behavior is forbidden");
  }
  if (/^\s*paths(?:-ignore)?:/m.test(workflow)) {
    violations.push("path filters must not skip validation");
  }

  if (!/runs-on: ubuntu-24\.04/.test(workflow)) violations.push("runner must be Ubuntu 24.04");
  if (!/cancel-in-progress: true/.test(workflow)) violations.push("missing run cancellation");
  if (!/timeout-minutes: 30/.test(workflow)) violations.push("missing job timeout");

  const uses = [...workflow.matchAll(/uses:\s+([^\s#]+)/g)].map((match) => match[1]);
  if (JSON.stringify(uses) !== JSON.stringify(expectedActions)) {
    violations.push("official actions must match immutable approved commits");
  }

  const commands = [...workflow.matchAll(/^\s*run:\s*(.+?)\s*$/gm)].map((match) => match[1]);
  for (const expected of [
    "npm ci",
    "sudo apt-get update && sudo apt-get install --yes lsof",
    "npx playwright install --with-deps chromium",
  ]) {
    if (!commands.includes(expected)) violations.push(`missing exact command: ${expected}`);
  }
  if (commands.filter((command) => command === "npm run validate").length !== 1) {
    violations.push("workflow must run the exact validation command once");
  }
  if (
    commands.some(
      (command) => command.startsWith("npm run validate") && command !== "npm run validate",
    )
  ) {
    violations.push("validation command must not be modified or suppressed");
  }

  return violations;
}
