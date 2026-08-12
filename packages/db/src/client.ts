import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadRepositoryEnv } from "./environment.js";

loadRepositoryEnv();

export type DbClient = PrismaClient;

/**
 * Creates a Prisma client for a direct PostgreSQL connection.
 */
export function createDbClient(databaseUrl?: string): DbClient {
  const connectionString = databaseUrl ?? process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(?:ql)?:\/\//.test(connectionString)) {
    throw new Error("DATABASE_URL must be a direct postgresql:// connection URL.");
  }

  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({ adapter });
}
