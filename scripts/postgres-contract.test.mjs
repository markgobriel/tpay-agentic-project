import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => fs.readFileSync(path, "utf8");

describe("PostgreSQL persistence contract", () => {
  it("keeps Prisma schema and migration PostgreSQL-native", () => {
    const schema = read("packages/db/prisma/schema.prisma");
    const migration = read("packages/db/prisma/migrations/20260811180000_init/migration.sql");
    const lock = read("packages/db/prisma/migrations/migration_lock.toml");

    expect(schema).toMatch(/provider\s*=\s*"postgresql"/);
    expect(schema).not.toMatch(/provider\s*=\s*"sqlite"/);
    expect(lock).toContain('provider = "postgresql"');
    expect(migration).toContain('CREATE TYPE "TransactionType" AS ENUM');
    expect(migration).toContain('CREATE TYPE "TransactionCategory" AS ENUM');
    expect(migration).toContain("TIMESTAMP(3)");
    expect(migration).not.toContain("DATETIME");
  });

  it("uses the official PostgreSQL adapter and exact-pinned local runtime", () => {
    const manifest = JSON.parse(read("packages/db/package.json"));
    const client = read("packages/db/src/client.ts");

    expect(manifest.dependencies["@prisma/client"]).toBe("7.9.1");
    expect(manifest.dependencies["@prisma/adapter-pg"]).toBe("7.9.1");
    expect(manifest.dependencies.pg).toBe("8.23.0");
    expect(manifest.devDependencies.prisma).toBe("7.9.1");
    expect(manifest.devDependencies["@prisma/dev"]).toBe("0.24.17");
    expect(client).toContain('from "@prisma/adapter-pg"');
    expect(client).toContain("new PrismaPg");
    expect(client).not.toContain("datasources:");
  });

  it("keeps preview, tests, and examples on the same PostgreSQL path", () => {
    const e2e = read("scripts/e2e.sh");
    const preview = read("scripts/preview-supervisor.sh");
    const env = read(".env.example");
    const client = read("packages/db/src/client.ts");
    const prismaConfig = read("packages/db/prisma.config.ts");
    const environment = read("packages/db/src/environment.ts");

    expect(e2e).toContain("packages/db/scripts/local-postgres.mjs");
    expect(preview).toContain("packages/db/scripts/local-postgres.mjs");
    expect(preview).toContain("trap cleanup EXIT");
    expect(preview).toContain("trap 'exit 0' INT TERM");
    expect(env).toMatch(/DATABASE_URL="postgresql:\/\//);
    expect(client).toContain("loadRepositoryEnv()");
    expect(environment).toContain('new URL("../../../.env", import.meta.url)');
    expect(environment).toContain("override: false");
    expect(prismaConfig).toContain('new URL("../../.env", import.meta.url)');
    expect(prismaConfig).toContain("override: false");
    expect(`${e2e}\n${preview}`).not.toMatch(/sqlite3|file:.*\.db/);
  });

  it("serializes browser files that share the isolated mutable goal", () => {
    const playwrightConfig = read("playwright.config.ts");

    expect(playwrightConfig).toContain("workers: 1");
    expect(playwrightConfig).toContain("fullyParallel: false");
  });
});
