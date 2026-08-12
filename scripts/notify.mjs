#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const [title = "Save & Spend", body = "Controller status changed."] = process.argv.slice(2);

if (process.platform !== "darwin") {
  console.log(`${title}: ${body}`);
  process.exit(0);
}

const applescript = [
  "on run argv",
  "  display notification (item 2 of argv) with title (item 1 of argv)",
  "end run",
].join("\n");

const result = spawnSync("osascript", ["-e", applescript, title, body], {
  encoding: "utf8",
});

if (result.error || result.status !== 0) {
  console.error(result.error?.message ?? result.stderr ?? "Notification failed.");
  process.exit(1);
}
