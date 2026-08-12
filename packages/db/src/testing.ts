import { createServer } from "node:net";
import { Pool } from "pg";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { startPrismaDevServer, type Server } from "@prisma/dev";
import { createDbClient, type DbClient } from "./client.js";

const migrationPath = fileURLToPath(
  new URL("../prisma/migrations/20260811180000_init/migration.sql", import.meta.url),
);

async function availablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        server.close();
        reject(new Error("Unable to allocate a local PostgreSQL port."));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function availablePorts(count: number): Promise<number[]> {
  const ports = new Set<number>();
  while (ports.size < count) ports.add(await availablePort());
  return [...ports];
}

export interface LocalPostgres {
  databaseUrl: string;
  db: DbClient;
  server: Server;
  close(): Promise<void>;
}

export async function startLocalPostgres(options: {
  name: string;
  persistenceMode?: "stateless" | "stateful";
  ports?: {
    server: number;
    database: number;
    shadow: number;
    streams: number;
  };
}): Promise<LocalPostgres> {
  const allocated = options.ports ? null : await availablePorts(4);
  const ports = options.ports ?? {
    server: allocated![0]!,
    database: allocated![1]!,
    shadow: allocated![2]!,
    streams: allocated![3]!,
  };

  const server = await startPrismaDevServer({
    name: options.name,
    persistenceMode: options.persistenceMode ?? "stateless",
    port: ports.server,
    databasePort: ports.database,
    shadowDatabasePort: ports.shadow,
    streamsPort: ports.streams,
  });
  const databaseUrl = server.database.connectionString;

  try {
    const migration = await readFile(migrationPath, "utf8");
    const migrationClient = new Pool({ connectionString: databaseUrl, max: 1 });
    try {
      await migrationClient.query(migration);
    } finally {
      await migrationClient.end();
    }
    const db = createDbClient(databaseUrl);
    return {
      databaseUrl,
      db,
      server,
      async close() {
        await db.$disconnect();
        await server.close();
      },
    };
  } catch (error) {
    await server.close();
    throw error;
  }
}

export async function startTestDatabase(label: string): Promise<LocalPostgres> {
  return startLocalPostgres({
    name: `save-spend-${label}-${process.pid}-${Date.now()}`,
    persistenceMode: "stateless",
  });
}
