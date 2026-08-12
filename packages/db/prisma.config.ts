import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

loadEnv({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: false,
  quiet: true,
});

const fallbackUrl = "postgresql://postgres:postgres@127.0.0.1:51214/template1?sslmode=disable";
const configuredUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed-cli.ts",
  },
  datasource: {
    // Generation and static checks do not connect. Runtime/migration scripts
    // always supply a concrete direct PostgreSQL URL.
    url: configuredUrl?.startsWith("postgres") ? configuredUrl : fallbackUrl,
  },
});
