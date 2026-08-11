import { createDbClient } from "../src/client.ts";
import { seedMockFinanceData } from "../src/seed.ts";

async function main(): Promise<void> {
  const db = createDbClient();
  try {
    const result = await seedMockFinanceData(db);
    console.log(
      `Seeded account=${result.accountId} transactions=${result.transactionCount} goal=${result.savingsGoalId}`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
