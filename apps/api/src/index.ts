import { createDbClient } from "@save-and-spend/db";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);

export { createApp } from "./app.js";
export { createFinanceService, HttpError } from "./finance-service.js";

if (process.env.NODE_ENV !== "test") {
  const db = createDbClient();
  const calculationDate = process.env.CALCULATION_DATE;
  const app = createApp({
    db,
    ...(calculationDate
      ? {
          now: () => {
            const instant = new Date(calculationDate);
            if (Number.isNaN(instant.getTime())) {
              throw new Error("CALCULATION_DATE must be a valid ISO-8601 instant.");
            }
            return instant;
          },
        }
      : {}),
  });
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
    if (calculationDate) {
      console.log(`Using CALCULATION_DATE=${calculationDate}`);
    }
  });
}
