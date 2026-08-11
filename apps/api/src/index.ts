import { createDbClient } from "@save-and-spend/db";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);

export { createApp } from "./app.js";
export { createFinanceService, HttpError } from "./finance-service.js";

if (process.env.NODE_ENV !== "test") {
  const db = createDbClient();
  const app = createApp({ db });
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
