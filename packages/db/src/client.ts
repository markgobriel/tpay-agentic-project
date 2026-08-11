import { PrismaClient } from "@prisma/client";

export type DbClient = PrismaClient;

/**
 * Creates a Prisma client. Callers supply DATABASE_URL (SQLite file URL for local/test).
 */
export function createDbClient(databaseUrl?: string): DbClient {
  if (databaseUrl !== undefined) {
    return new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });
  }
  return new PrismaClient();
}
