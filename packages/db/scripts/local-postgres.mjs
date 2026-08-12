import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { startPrismaDevServer } from "@prisma/dev";
import { Pool } from "pg";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
const migrationPath = fileURLToPath(
  new URL("../prisma/migrations/20260811180000_init/migration.sql", import.meta.url),
);

function parseArgs(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    values.set(args[index], args[index + 1]);
  }
  return values;
}

async function availablePort() {
  return new Promise((resolve, reject) => {
    const socket = createServer();
    socket.unref();
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", () => {
      const address = socket.address();
      if (!address || typeof address === "string") {
        socket.close();
        reject(new Error("Unable to allocate a local PostgreSQL port."));
        return;
      }
      socket.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function availablePorts(count) {
  const ports = new Set();
  while (ports.size < count) ports.add(await availablePort());
  return [...ports];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.get("--mode") ?? "stateless";
  if (mode !== "stateless" && mode !== "stateful") {
    throw new Error("--mode must be stateless or stateful");
  }

  const name = args.get("--name") ?? `save-spend-${process.pid}`;
  const envFile = args.get("--output-env") ?? ".agent/local-postgres.env";
  const readyFile = args.get("--ready-file") ?? ".agent/local-postgres.ready";
  const pidFile = args.get("--pid-file") ?? ".agent/local-postgres.pid";
  const allocated = await availablePorts(4);
  const serverPort = Number(args.get("--server-port") ?? allocated[0]);
  const databasePort = Number(args.get("--database-port") ?? allocated[1]);
  const shadowPort = Number(args.get("--shadow-port") ?? allocated[2]);
  const streamsPort = Number(args.get("--streams-port") ?? allocated[3]);

  mkdirSync(`${repositoryRoot}/.agent`, { recursive: true });
  const server = await startPrismaDevServer({
    name,
    persistenceMode: mode,
    port: serverPort,
    databasePort,
    shadowDatabasePort: shadowPort,
    streamsPort,
  });

  const databaseUrl = server.database.connectionString;
  const migration = await readFile(migrationPath, "utf8");
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    const applied = await pool.query(
      `SELECT to_regclass('public."Account"') IS NOT NULL AS present`,
    );
    if (!applied.rows[0]?.present) await pool.query(migration);
  } finally {
    await pool.end();
  }

  writeFileSync(`${repositoryRoot}/${envFile}`, `DATABASE_URL=${databaseUrl}\n`, { mode: 0o600 });
  writeFileSync(`${repositoryRoot}/${pidFile}`, `${process.pid}\n`);
  writeFileSync(`${repositoryRoot}/${readyFile}`, `${new Date().toISOString()}\n`);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());

  // The local database listeners keep this process alive until its supervisor stops it.
  await new Promise(() => undefined);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
