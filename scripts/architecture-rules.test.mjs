import { describe, expect, it } from "vitest";
import {
  extractImportSpecifiers,
  findArchitectureViolations,
  isProductionSource,
} from "./architecture-rules.mjs";

describe("architecture boundaries", () => {
  it("extracts static, type-only, export, side-effect, and dynamic imports", () => {
    expect(
      extractImportSpecifiers(`
        import React from "react";
        import type { Account } from '@save-and-spend/contracts';
        import "./setup.js";
        export { thing } from "./thing.js";
        const lazy = import("@save-and-spend/domain");
      `),
    ).toEqual([
      "react",
      "@save-and-spend/contracts",
      "./setup.js",
      "./thing.js",
      "@save-and-spend/domain",
    ]);
  });

  it("uses syntax-aware extraction instead of treating comments as imports", () => {
    expect(
      extractImportSpecifiers(`
        // import { db } from "@save-and-spend/db";
        const example = 'import express from "express"';
      `),
    ).toEqual([]);
  });

  it("rejects forbidden cross-layer and framework dependencies", () => {
    const violations = findArchitectureViolations([
      { path: "apps/web/src/bad.ts", source: 'import { db } from "@save-and-spend/db";' },
      {
        path: "apps/web/src/also-bad.ts",
        source: 'import "../../../packages/domain/src/index.js";',
      },
      {
        path: "apps/web/src/root-bypass.ts",
        source: 'import "../../../packages/domain";',
      },
      {
        path: "apps/api/src/root-bypass.ts",
        source: 'import "../../web";',
      },
      { path: "packages/domain/src/bad.ts", source: 'import express from "express";' },
      {
        path: "packages/db/src/bad.ts",
        source: 'import { calculate } from "@save-and-spend/domain";',
      },
      { path: "apps/api/src/bad.ts", source: 'import React from "react";' },
      { path: "packages/contracts/src/bad.ts", source: 'import fs from "node:fs";' },
    ]);

    expect(violations).toHaveLength(8);
    expect(violations.join("\n")).toContain("web must not depend on db");
    expect(violations.join("\n")).toContain("web must not depend on domain");
    expect(violations.join("\n")).toContain("domain has an unapproved runtime dependency");
    expect(violations.join("\n")).toContain("db must not depend on domain");
    expect(violations.join("\n")).toContain("api has an unapproved runtime dependency");
    expect(violations.join("\n")).toContain("contracts must not depend on the Node runtime");
  });

  it("allows the approved modular-monolith dependency direction", () => {
    expect(
      findArchitectureViolations([
        {
          path: "apps/web/src/App.tsx",
          source: 'import React from "react"; import type { A } from "@save-and-spend/contracts";',
        },
        {
          path: "apps/api/src/app.ts",
          source:
            'import fs from "fs"; import path from "node:path"; import express from "express"; import { x } from "@save-and-spend/domain"; import { y } from "@save-and-spend/db";',
        },
        { path: "packages/domain/src/goals.ts", source: 'import { money } from "./money.js";' },
        {
          path: "packages/db/src/client.ts",
          source:
            'import fs from "node:fs"; import path from "path"; import { PrismaClient } from "@prisma/client";',
        },
        { path: "packages/contracts/src/index.ts", source: "export interface Account {}" },
      ]),
    ).toEqual([]);
  });

  it("does not treat test-only tooling imports as production dependencies", () => {
    expect(
      findArchitectureViolations([
        { path: "packages/domain/src/index.test.ts", source: 'import { describe } from "vitest";' },
      ]),
    ).toEqual([]);
    expect(isProductionSource("packages/domain/src/index.test.ts")).toBe(false);
  });

  it("rejects bare and node-prefixed built-ins outside server layers", () => {
    const violations = findArchitectureViolations([
      { path: "apps/web/src/bad.ts", source: 'import path from "path";' },
      { path: "packages/domain/src/bad.ts", source: 'import fs from "node:fs";' },
      { path: "packages/contracts/src/bad.ts", source: 'import os from "os";' },
    ]);

    expect(violations).toHaveLength(3);
    expect(violations.every((violation) => violation.includes("Node runtime"))).toBe(true);
  });
});
