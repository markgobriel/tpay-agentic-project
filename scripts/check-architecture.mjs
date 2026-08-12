#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { findArchitectureViolations, isProductionSource } from "./architecture-rules.mjs";

const sourceRoots = [
  "apps/web/src",
  "apps/api/src",
  "packages/domain/src",
  "packages/db/src",
  "packages/contracts/src",
];

function collectSourceFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSourceFiles(filePath));
    if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) {
      files.push({ path: filePath, source: fs.readFileSync(filePath, "utf8") });
    }
  }
  return files;
}

const files = sourceRoots
  .flatMap(collectSourceFiles)
  .filter((file) => isProductionSource(file.path));
const violations = findArchitectureViolations(files);

if (violations.length > 0) {
  console.error("Architecture boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`Architecture boundaries passed (${files.length} source files checked).`);
}
