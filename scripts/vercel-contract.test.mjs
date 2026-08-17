import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => fs.readFileSync(path, "utf8");

describe("Vercel deployment contract", () => {
  it("builds the Vite app and preserves API routes before the SPA fallback", () => {
    const config = JSON.parse(read("vercel.json"));

    expect(config.framework).toBe("vite");
    expect(config.buildCommand).toBe("npm run build");
    expect(config.outputDirectory).toBe("apps/web/dist");
    expect(config.functions["api/**/*.ts"].maxDuration).toBe(30);
    expect(config.rewrites).toEqual([{ source: "/(.*)", destination: "/index.html" }]);

    const manifest = JSON.parse(read("package.json"));
    expect(manifest.scripts.build).toMatch(
      /^npm run db:generate -w @save-and-spend\/db && npm run build --workspaces/,
    );
  });

  it("exposes every browser dependency through the shared Express application", () => {
    const expectedRoutes = [
      "account",
      "analytics",
      "health",
      "recommendations",
      "savings-goal",
      "transactions",
      "meta/timezone-policy",
    ];

    for (const route of expectedRoutes) {
      const source = read(`api/${route}.ts`);
      expect(source).toContain("vercel-app.js");
    }

    const server = read("server/vercel-app.ts");
    expect(server).toContain('app.use(\n  "/api"');
    expect(server).toContain("createDbClient()");
    expect(server).toContain('process.env.CALCULATION_DATE ?? "2026-07-15T12:00:00.000Z"');
  });

  it("uses the /api prefix only in production browser builds", () => {
    const pathHelper = read("apps/web/src/apiPath.ts");
    const apiClient = read("apps/web/src/api.ts");

    expect(pathHelper).toContain('import.meta.env.PROD ? "/api" : ""');
    expect(apiClient).toContain("fetch(apiPath(path), init)");
  });

  it("documents the reproducible production handoff without hiding the env example", () => {
    const readme = read("README.md");
    const ignoreLines = read(".gitignore").split(/\r?\n/);
    const eslintConfig = read("eslint.config.js");

    expect(readme).toContain("https://tpay-harness-engineering.vercel.app/");
    expect(readme).toContain("vercel pull --yes --environment production");
    expect(readme).toContain("vercel build --prod");
    expect(ignoreLines).toContain("!.env.example");
    expect(ignoreLines).not.toContain(".env*");
    expect(eslintConfig).toContain('"api/**/*.{ts,tsx}"');
    expect(eslintConfig).toContain('"server/**/*.{ts,tsx}"');
    expect(eslintConfig).toContain('".vercel/**"');
  });
});
